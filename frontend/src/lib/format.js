export function formatRupiah(value) {
  const number = Number(value) || 0;
  const hasFraction = Math.round(number * 100) % 100 !== 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(number)
    .replace(/\u00a0/g, ' ');
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
}

export function parseInteger(value) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

export function parseDecimal(value) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

export function initials(name) {
  return String(name || '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
