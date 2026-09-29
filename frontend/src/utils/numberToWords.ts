/**
 * Converts a number or numeric string into Indian currency words.
 * Example: 165000 -> "One Lakh Sixty Five Thousand Rupees Only"
 */
export function numberToWords(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const numericValue = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  if (isNaN(numericValue)) {
    return "";
  }

  const n = Math.floor(Math.abs(numericValue));
  if (n === 0) {
    return "Zero Rupees Only";
  }

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertBelowHundred(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num];
    const unit = num % 10;
    return tens[Math.floor(num / 10)] + (unit ? " " + ones[unit] : "");
  }

  function convertBelowThousand(num: number): string {
    let result = "";
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundred > 0) {
      result += ones[hundred] + " Hundred";
      if (remainder > 0) result += " ";
    }
    if (remainder > 0) {
      result += convertBelowHundred(remainder);
    }
    return result;
  }

  let words = "";

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  if (crore > 0) {
    words += (crore < 100 ? convertBelowHundred(crore) : convertBelowThousand(crore)) + " Crore ";
  }
  if (lakh > 0) {
    words += convertBelowHundred(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertBelowHundred(thousand) + " Thousand ";
  }
  if (rem > 0) {
    words += convertBelowThousand(rem);
  }

  const result = words.trim() + " Rupees Only";
  return result;
}

export const convertToIndianWords = numberToWords;
export default numberToWords;

