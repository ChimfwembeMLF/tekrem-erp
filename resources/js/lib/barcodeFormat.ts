export type BarcodeFormat = 'EAN13' | 'CODE128';

export function detectBarcodeFormat(value: string, preferred: BarcodeFormat = 'EAN13'): BarcodeFormat {
  if (preferred === 'EAN13' && /^\d{13}$/.test(value)) {
    return 'EAN13';
  }

  return 'CODE128';
}
