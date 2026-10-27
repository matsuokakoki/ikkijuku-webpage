export const CLOSURES_API =
  'https://juku-attendance-system.juku-matsuokakoki.workers.dev/public/v1/closures';
export interface Closure {
  date: string;
  reason: string;
}
export interface Closures {
  version: 1;
  timezone: 'Asia/Tokyo';
  closures: Closure[];
}
export function monthPeriod(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw Error('Invalid calendar month');
  const [year, number] = month.split('-').map(Number);
  return {
    from: month + '-01',
    to: month + '-' + new Date(Date.UTC(year, number, 0)).getUTCDate(),
  };
}
export function parseClosures(input: unknown, from: string, to: string): Closures {
  const data = input as Partial<Closures> | null;
  if (
    !data ||
    data.version !== 1 ||
    data.timezone !== 'Asia/Tokyo' ||
    !Array.isArray(data.closures)
  )
    throw Error('Unexpected closures response');
  const dates = new Set<string>();
  const closures = data.closures.map((row) => {
    if (
      !row ||
      typeof row.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
      !Number.isFinite(Date.parse(row.date + 'T00:00:00Z')) ||
      new Date(row.date + 'T00:00:00Z').toISOString().slice(0, 10) !== row.date ||
      row.date < from ||
      row.date > to ||
      dates.has(row.date) ||
      typeof row.reason !== 'string' ||
      row.reason.length > 2000
    )
      throw Error('Invalid closure entry');
    dates.add(row.date);
    return { date: row.date, reason: row.reason };
  });
  return { version: 1, timezone: 'Asia/Tokyo', closures };
}
export async function fetchClosures(month: string): Promise<Closures> {
  const { from, to } = monthPeriod(month);
  const url = new URL(CLOSURES_API);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error(`Closures API HTTP ${response.status}`);
  return parseClosures(await response.json(), from, to);
}
