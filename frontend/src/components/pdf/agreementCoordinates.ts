/**
 * Agreement PDF Absolute Field Coordinates
 * Page: A4 Portrait (210mm x 297mm = 595.28pt x 841.89pt)
 * All values in PostScript points (pt).
 * 1 mm = 2.83465 pt; 9 mm = 25.51 pt.
 */

export interface FieldBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const PAGE_DIMENSIONS = {
  width: 595.28,
  height: 841.89,
};

export const HEADER_COORDINATES = {
  billNo: { x: 63.5, y: 162.0, width: 72.0, height: 14.0 },
  place: { x: 210.8, y: 162.0, width: 95.0, height: 14.0 },
  date: { x: 379.8, y: 162.0, width: 81.0, height: 14.0 },
  time: { x: 527.1, y: 162.0, width: 48.0, height: 14.0 },
};

export const OWNER_VEHICLE_COORDINATES = {
  registeredOwnerName: { x: 128.0, y: 195.0, width: 447.0, height: 14.0 },
  addressLine1: { x: 73.6, y: 213.0, width: 501.0, height: 13.0 },
  addressLine2: { x: 73.6, y: 231.0, width: 501.0, height: 13.0 },
  make: { x: 51.2, y: 250.0, width: 255.0, height: 13.0 },
  vehicleNo: { x: 403.0, y: 250.0, width: 172.0, height: 13.0 },
  model: { x: 52.7, y: 268.0, width: 253.0, height: 13.0 },
  chassisNo: { x: 403.0, y: 268.0, width: 172.0, height: 13.0 },
  engineNo: { x: 86.8, y: 286.0, width: 488.0, height: 13.0 },
};

export const SENTENCE_COORDINATES = {
  buyerName: { x: 221.7, y: 305.0, width: 353.0, height: 14.0 },
};

export const PRICE_COORDINATES = {
  purchasePrice: { x: 325.5, y: 340.5, width: 151.0, height: 13.0 },
  priceWords: { x: 93.0, y: 358.5, width: 384.0, height: 13.0 },
  purchaserSignature: { x: 124.0, y: 377.5, width: 352.0, height: 15.0 },
};

export const SELLER_BLOCK_COORDINATES = {
  photo: { x: 17.1, y: 454.7, width: 79.8, height: 72.4 },
  thumb: { x: 108.5, y: 467.0, width: 79.1, height: 46.9 },
  name: { x: 52.7, y: 521.3, width: 135.0, height: 12.0 },
  addressLine1: { x: 63.6, y: 537.7, width: 125.0, height: 11.0 },
  addressLine2: { x: 63.6, y: 554.1, width: 125.0, height: 11.0 },
  sign: { x: 46.5, y: 584.0, width: 135.0, height: 14.0 },
  cell: { x: 42.6, y: 601.8, width: 140.0, height: 12.0 },
  aadhaar: { x: 71.3, y: 618.3, width: 110.0, height: 12.0 },
};

export const PURCHASER_BLOCK_COORDINATES = {
  photo: { x: 210.1, y: 454.7, width: 79.8, height: 72.4 },
  thumb: { x: 301.5, y: 467.0, width: 79.1, height: 46.9 },
  name: { x: 245.7, y: 521.3, width: 135.0, height: 12.0 },
  addressLine1: { x: 256.6, y: 537.7, width: 125.0, height: 11.0 },
  addressLine2: { x: 256.6, y: 554.1, width: 125.0, height: 11.0 },
  sign: { x: 239.5, y: 584.0, width: 135.0, height: 14.0 },
  cell: { x: 235.6, y: 601.8, width: 140.0, height: 12.0 },
  aadhaar: { x: 264.3, y: 618.3, width: 110.0, height: 12.0 },
};

export const WITNESS_BLOCK_COORDINATES = {
  photo: { x: 403.8, y: 454.7, width: 79.8, height: 72.4 },
  thumb: { x: 495.3, y: 467.0, width: 79.1, height: 46.9 },
  name: { x: 439.5, y: 521.3, width: 135.0, height: 12.0 },
  addressLine1: { x: 450.3, y: 537.7, width: 125.0, height: 11.0 },
  addressLine2: { x: 450.3, y: 554.1, width: 125.0, height: 11.0 },
  sign: { x: 433.3, y: 584.0, width: 135.0, height: 14.0 },
  cell: { x: 429.4, y: 601.8, width: 140.0, height: 12.0 },
  aadhaar: { x: 458.1, y: 618.3, width: 110.0, height: 12.0 },
};

// 9mm x 9mm checkboxes (9mm = 25.51pt)
export const CHECKBOX_COORDINATES = {
  size: 25.51,
  insurance: { x: 87.2, y: 661.5, width: 25.51, height: 25.51 },
  fc: { x: 87.2, y: 686.9, width: 25.51, height: 25.51 },
  tax: { x: 87.2, y: 712.4, width: 25.51, height: 25.51 },
  cc: { x: 87.2, y: 737.9, width: 25.51, height: 25.51 },
};

export const PAYMENT_COORDINATES = {
  price: { x: 472.8, y: 665.0, width: 103.9, height: 22.0 },
  advancePaid: { x: 472.8, y: 694.0, width: 103.9, height: 22.0 },
  balanceAmount: { x: 472.8, y: 723.0, width: 103.9, height: 22.0 },
  toAndInsurance: { x: 472.8, y: 754.0, width: 103.9, height: 22.0 },
};
