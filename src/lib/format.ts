const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDay(date: string | null | undefined): string {
  if (!date) return 'Dado indisponível';
  if (!isValidDate(date)) return 'Dado indisponível';
  return dayFormatter.format(new Date(`${date}T00:00:00Z`));
}

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return 'Dado indisponível';
  const match = /^(\d{4}-\d{2}-\d{2})T((?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  return match && isValidDate(match[1]) ? match[2] : 'Dado indisponível';
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Dado indisponível';
  const match = /^(\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match) return 'Dado indisponível';
  const [date, time] = match[1].split('T');
  return isValidDate(date) ? `${formatDay(date)} ${time}` : 'Dado indisponível';
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDayLabel(iso: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return WEEKDAYS[parseLocalDate(iso).getDay()] ?? '';
}

export function getShortDate(iso: string): string {
  const date = parseLocalDate(iso);
  const month = MONTHS[date.getMonth()] ?? '';
  return `${date.getDate()} ${month}`;
}