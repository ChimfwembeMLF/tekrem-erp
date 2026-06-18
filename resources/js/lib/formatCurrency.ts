export function formatZmw(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) {
    return '—';
  }

  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
  }).format(amount);
}
