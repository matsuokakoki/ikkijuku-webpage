import { contentSchema, type Content } from './schema';
type Row = Record<string, any>;
export function normalizeMicrocms(
  site: Row,
  news: Row[],
  achievements: Row[],
  calendar: Content['calendar'],
) {
  const result = contentSchema.parse({
    site,
    news: news.map((row) => ({
      id: row.id,
      date:
        row.date ||
        new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
          new Date(row.publishedAt),
        ),
      title: row.title || 'お知らせ',
      body: row.content || '',
    })),
    achievements: achievements.map((row) => ({
      ...row,
      groups: (row.groups || []).map((group: Row) => ({
        ...group,
        items: (group.items || []).map((item: Row) => ({
          ...item,
          department: item.department || '',
          note: item.note || '',
          count: item.count ?? null,
        })),
      })),
    })),
    calendar,
  });
  const years = new Set<number>();
  for (const row of result.achievements) {
    if (years.has(row.year)) throw Error(`年度が重複しています: ${row.year}`);
    years.add(row.year);
  }
  const months = new Set<string>();
  for (const row of result.calendar) {
    if (months.has(row.month)) throw Error(`対象月が重複しています: ${row.month}`);
    months.add(row.month);
  }
  result.news.sort((a, b) => b.date.localeCompare(a.date));
  result.achievements.sort((a, b) => b.year - a.year);
  return result;
}
