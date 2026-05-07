export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
}

export function formatPercent(current: number, previous: number): string {
  if (previous === 0) return '0.00%';
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatPriceChange(current: number, previous: number): number {
  return current - previous;
}
