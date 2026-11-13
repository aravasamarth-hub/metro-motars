"""
Metro Motors — Billing Integrity Service
Provides deterministic financial calculations, rounding validation,
bill-number format verification, and duplicate prevention schemas.
Derived from Agent 27 (Document Extraction) and Agent 31 (Invoice Processing).
"""

import math
import re
from decimal import ROUND_HALF_UP, Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

BILL_NUMBER_REGEX = re.compile(r"^MM-\d{2}-\d{4}$")

ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
]
TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]


def two_digit_words(value: int) -> str:
    if value < 20:
        return ONES[value]
    return (TENS[value // 10] + (" " + ONES[value % 10] if value % 10 else "")).strip()


def amount_in_words(amount: float) -> str:
    """Converts a rupee amount into Indian numbering system words (Lakh, Crore)."""
    rupees = int(round(float(amount or 0)))
    if rupees == 0:
        return "Zero Rupees Only"
    if rupees < 0:
        return "Negative " + amount_in_words(abs(rupees))
    parts: list[str] = []
    for divisor, label in ((10000000, "Crore"), (100000, "Lakh"), (1000, "Thousand"), (100, "Hundred")):
        chunk, rupees = divmod(rupees, divisor)
        if chunk:
            parts.append(f"{two_digit_words(chunk)} {label}")
    if rupees:
        parts.append(two_digit_words(rupees))
    return " ".join(parts) + " Rupees Only"


def round_currency(val: float | int | str) -> float:
    """Deterministic 2-decimal financial rounding using Decimal and ROUND_HALF_UP."""
    d = Decimal(str(val))
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


class BillFinancialCalculationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    selling_price: float = Field(..., ge=0, description="Base selling price of the vehicle")
    discount: float = Field(default=0.0, ge=0, description="Agreed discount amount")
    additional_charges: float = Field(default=0.0, ge=0, description="RTO, insurance, or refurbishment charges")
    advance_received: float = Field(default=0.0, ge=0, description="Advance or token payment received from customer")
    gst_rate_percent: float | None = Field(
        default=None, ge=0, le=100, description="GST percentage if applicable; None if exempt or missing business rule"
    )

    @field_validator("selling_price", "discount", "additional_charges", "advance_received")
    @classmethod
    def validate_finite(cls, v: float) -> float:
        if not math.isfinite(v):
            raise ValueError("Financial amount must be a finite number.")
        return round_currency(v)


class BillFinancialCalculationResponse(BaseModel):
    selling_price: float
    discount: float
    additional_charges: float
    subtotal: float
    final_invoice_amount: float
    advance_received: float
    remaining_balance: float
    payment_status: Literal["Paid", "Partially Paid", "Advance Paid", "Pending", "Credit / Overpaid"]
    amount_in_words: str
    gst_rate_percent: float | None
    tax_amount: float
    grand_total_with_tax: float
    missing_business_rules: list[str] = Field(default_factory=list)


_CENT = Decimal("0.01")
_ZERO = Decimal("0.0")


def _to_money(value: Decimal) -> float:
    """Quantizes a Decimal to paise using ROUND_HALF_UP."""
    return float(value.quantize(_CENT, rounding=ROUND_HALF_UP))


def _validate_non_negative_amounts(**amounts: float) -> None:
    """Raises ValueError if any named amount is negative or non-finite."""
    labels = {
        "selling_price": "Selling price",
        "discount": "Discount",
        "additional_charges": "Additional charges",
        "advance_received": "Advance received",
    }
    for name, value in amounts.items():
        if not math.isfinite(value) or value < 0:
            raise ValueError(f"{labels.get(name, name)} must be a non-negative finite number.")


def _calculate_tax(final_dec: Decimal, final_amount: float, gst_rate_percent: float | None):
    """Returns (tax_amount, grand_total, missing_rules). Never invents a tax rate."""
    if gst_rate_percent is None:
        return 0.0, final_amount, [
            "GST tax rate unconfigured: calculation uses base invoice total without invented tax rates."
        ]
    tax_amount = _to_money((final_dec * Decimal(str(gst_rate_percent))) / Decimal("100.0"))
    return tax_amount, round_currency(final_amount + tax_amount), []


def _derive_payment_status(final_amount: float, advance: float) -> str:
    """Maps invoice total vs advance into a payment status (order of checks is significant)."""
    if final_amount > 0 and advance >= final_amount:
        return "Paid"
    if 0 < advance < final_amount:
        return "Partially Paid"
    if final_amount == 0 and advance > 0:
        return "Advance Paid"
    if advance > final_amount > 0:  # Unreachable today ("Paid" wins); kept for contract parity.
        return "Credit / Overpaid"
    return "Pending"


def calculate_bill_financials(
    selling_price: float,
    discount: float = 0.0,
    additional_charges: float = 0.0,
    advance_received: float = 0.0,
    gst_rate_percent: float | None = None,
) -> BillFinancialCalculationResponse:
    """
    Deterministically computes vehicle bill financials matching BuyerBillDocument logic.
    Guarantees no floating-point rounding drift.
    """
    _validate_non_negative_amounts(
        selling_price=selling_price,
        discount=discount,
        additional_charges=additional_charges,
        advance_received=advance_received,
    )

    sp_dec, disc_dec, add_dec, adv_dec = (
        Decimal(str(v)) for v in (selling_price, discount, additional_charges, advance_received)
    )
    final_dec = max(_ZERO, sp_dec - disc_dec + add_dec)
    final_amount = _to_money(final_dec)
    advance = _to_money(adv_dec)
    tax_amount, grand_total, missing_rules = _calculate_tax(final_dec, final_amount, gst_rate_percent)

    return BillFinancialCalculationResponse(
        selling_price=_to_money(sp_dec),
        discount=_to_money(disc_dec),
        additional_charges=_to_money(add_dec),
        subtotal=_to_money(sp_dec + add_dec),
        final_invoice_amount=final_amount,
        advance_received=advance,
        remaining_balance=_to_money(max(_ZERO, final_dec - adv_dec)),
        payment_status=_derive_payment_status(final_amount, advance),
        amount_in_words=amount_in_words(grand_total),
        gst_rate_percent=gst_rate_percent,
        tax_amount=tax_amount,
        grand_total_with_tax=grand_total,
        missing_business_rules=missing_rules,
    )


def is_valid_bill_number_format(bill_number: str) -> bool:
    """Checks whether bill number adheres to official MM-YY-NNNN pattern."""
    if not bill_number or not isinstance(bill_number, str):
        return False
    return bool(BILL_NUMBER_REGEX.match(bill_number.strip()))
