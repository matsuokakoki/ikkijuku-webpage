import saved from '../data/closures-snapshot.json';
import { fetchClosures } from './closures';
export async function getPublicCalendar() {
  // Only the public attendance API is authoritative. Build failures preserve the last deployment.
  const current = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
  const [year, month] = current.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month, 1));
  const next = nextDate.toISOString().slice(0, 7);
  const months = [...new Set([...saved.map((x) => x.month), current, next])].sort();
  const calendar = [];
  for (const month of months) {
    const result = await fetchClosures(month);
    calendar.push({
      id: month.replace('-', ''),
      month,
      days: result.closures.map((x) => x.date),
      reasons: Object.fromEntries(result.closures.map((x) => [x.date, x.reason])),
      note: '日曜日は定休日です。',
      fetchedAt: new Date().toISOString(),
    });
  }
  return calendar;
}
