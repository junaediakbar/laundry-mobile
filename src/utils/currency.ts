const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrencyIdr(value: string | number): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return idr.format(0);
  return idr.format(n);
}

export function sumMoney(values: string[]): number {
  return values.reduce((acc, v) => {
    const n = Number(v);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}
