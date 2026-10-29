"""
Metro Motors — Billing Integrity Service
Provides deterministic financial calculations, rounding validation,
bill-number format verification, and duplicate prevention schemas.
Derived from Agent 27 (Document Extraction) and Agent 31 (Invoice Processing).
"""

from decimal import Decimal, ROUND_HALF_UP
import math
import re
from typing import Any, Literal
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
    if not math.isfinite(selling_price) or selling_price < 0:
        raise ValueError("Selling price must be a non-negative finite number.")
    if not math.isfinite(discount) or discount < 0:
        raise ValueError("Discount must be a non-negative finite number.")
    if not math.isfinite(additional_charges) or additional_charges < 0:
        raise ValueError("Additional charges must be a non-negative finite number.")
    if not math.isfinite(advance_received) or advance_received < 0:
        raise ValueError("Advance received must be a non-negative finite number.")

    sp_dec = Decimal(str(selling_price))
    disc_dec = Decimal(str(discount))
    add_dec = Decimal(str(additional_charges))
    adv_dec = Decimal(str(advance_received))

    subtotal_dec = sp_dec + add_dec
    final_dec = max(Decimal("0.0"), sp_dec - disc_dec + add_dec)
    balance_dec = max(Decimal("0.0"), final_dec - adv_dec)

    sp = float(sp_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    disc = float(disc_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    add_chg = float(add_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    adv = float(adv_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    subtotal = float(subtotal_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    final_amount = float(final_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    balance = float(balance_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    missing_rules: list[str] = []
    tax_amount = 0.0
    grand_total = final_amount
    if gst_rate_percent is not None:
        rate_dec = Decimal(str(gst_rate_percent))
        tax_dec = (final_dec * rate_dec) / Decimal("100.0")
        tax_amount = float(tax_dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        grand_total = round_currency(final_amount + tax_amount)
    else:
        missing_rules.append("GST tax rate unconfigured: calculation uses base invoice total without invented tax rates.")

    if final_amount > 0 and adv >= final_amount:
        status = "Paid"
    elif adv > 0 and adv < final_amount:
        status = "Partially Paid"
    elif final_amount == 0 and adv > 0:
        status = "Advance Paid"
    elif adv > final_amount and final_amount > 0:
        status = "Credit / Overpaid"
    else:
        status = "Pending"

    words = amount_in_words(grand_total)

    return BillFinancialCalculationResponse(
        selling_price=sp,
        discount=disc,
        additional_charges=add_chg,
        subtotal=subtotal,
        final_invoice_amount=final_amount,
        advance_received=adv,
        remaining_balance=balance,
        payment_status=status,
        amount_in_words=words,
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
