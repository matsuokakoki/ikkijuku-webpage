import type { Content } from './schema';
export function calendarNavigation(calendar: Content['calendar']) {
  const months = calendar.toSorted((a, b) => a.month.localeCompare(b.month));
  const current = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
  const selected = months.find((x) => x.month === current) || months.at(-1);
  return { months, selected, index: selected ? months.indexOf(selected) : -1 };
}
