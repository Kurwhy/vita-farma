const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const MONTHS_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAYS_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const pad2 = (value) => String(value).padStart(2, '0');

export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function compactDate(dateStr) {
  return (dateStr || '').replaceAll('-', '');
}

export function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function localDateTime(hour, minute = 0, dayOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(hour)}:${pad2(minute)}:00`;
}

export function localNowISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}

function parts(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const { year, month, day } = parts(dateStr.slice(0, 10));
  return new Date(year, month - 1, day);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const { year, month, day } = parts(dateStr.slice(0, 10));
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  const { year, month, day } = parts(dateStr.slice(0, 10));
  const date = new Date(year, month - 1, day);
  return `${DAYS_LONG[date.getDay()]}, ${day} ${MONTHS_LONG[month - 1]} ${year}`;
}

export function formatDateTime(value) {
  if (!value) return '-';
  const datePart = value.slice(0, 10);
  const timePart = value.slice(11, 16);
  return timePart ? `${formatDate(datePart)} ${timePart}` : formatDate(datePart);
}

export function isPast(dateStr) {
  return Boolean(dateStr) && dateStr.slice(0, 10) < todayISO();
}

export function todayLongLabel() {
  return formatDateLong(todayISO());
}
