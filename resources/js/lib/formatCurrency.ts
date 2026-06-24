export const DEFAULT_CURRENCY = 'ZMW';

export function formatZmw(amount: number | null | undefined, fallback = '—'): string {
  if (amount == null || Number.isNaN(Number(amount))) {
    return fallback;
  }

  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}
