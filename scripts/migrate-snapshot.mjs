// Reads an explicitly exported public-content snapshot, never student data.
import fs from 'node:fs/promises';
const input = process.argv[2];
if (!input) throw Error('Usage: node scripts/migrate-snapshot.mjs <export-directory>');
const read = async (name) => JSON.parse(await fs.readFile(`${input}/${name}.json`, 'utf8'));
function decode(v) {
  if (v.mapValue)
    return Object.fromEntries(
      Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x)]),
    );
  if (v.arrayValue) return (v.arrayValue.values || []).map(decode);
  if ('integerValue' in v) return Number(v.integerValue);
  return Object.values(v)[0];
}
const doc = (d) =>
  Object.fromEntries(
    Object.entries(d.fields || {})
      .filter(([k]) => k !== 'dummy')
      .map(([k, v]) => [k, decode(v)]),
  );
const price = doc(await read('timeprice'));
const summary = doc(await read('achievements'));
const acceptance = doc(await read('lwniX7ytVlSFJ07WiXFY'));
const news = (await read('news')).documents.map((d) => ({
  id: d.name.split('/').at(-1),
  date: doc(d).time,
  title: doc(d).text,
  body: doc(d).text,
}));
const achievements = (await read('yearly')).map((y) => {
  const meta = doc(y.meta[0] || {});
  return {
    id: String(y.year),
    year: Number(y.year),
    high: Number(meta.high || 0),
    ronin: Number(meta.ronin || 0),
    junior: Number(meta.junior || 0),
    groups: [
      ['university', '大学受験'],
      ['highschool', '高校受験'],
      ['junior', '中学受験'],
    ].map(([key, label]) => ({
      label,
      items: y[key].map((d) => {
        const v = doc(d);
        return {
          school: String(v.school || ''),
          department: String(v.department || ''),
          count: v.count === undefined ? null : Number(v.count),
          note: String(v.note || ''),
        };
      }),
    })),
  };
});
const site = {
  acceptance: acceptance.index,
  universityLabel: summary.univ_label,
  highschoolLabel: summary.high_label,
  universitySummary: summary.univ_list,
  highschoolSummary: summary.high_list,
  priceNote: price.price_note_top,
  juniorFee: price.fee_junior,
  highFee: price.fee_high,
  priceFooter: price.price_note_bottom,
  schedule: [
    ['平日', 'schedule_weekday'],
    ['土曜', 'schedule_saturday'],
    ['日曜', 'schedule_sunday'],
  ].map(([label, key]) => ({ label, value: price[key] })),
  examples: Array.from({ length: 6 }, (_, n) => ({
    label: price[`example${n + 1}_label`],
    value: price[`example${n + 1}_price`],
  })),
};
let calendar = [];
try {
  calendar = await read('calendar');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await fs.writeFile(
  'src/data/snapshot.json',
  JSON.stringify(
    {
      site,
      news: news.sort((a, b) => b.date.localeCompare(a.date)),
      achievements: achievements.sort((a, b) => b.year - a.year),
      calendar,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Migrated ${news.length} news items and ${achievements.length} years`);
