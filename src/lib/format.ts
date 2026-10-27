import sanitizeHtml from 'sanitize-html';
export function richText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  });
}
export const formatDate = (date: string) => date.replaceAll('-', '.');
export function monthCells(month: string, days: string[]) {
  const [year, m] = month.split('-').map(Number);
  const offset = new Date(Date.UTC(year, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    if (day < 1 || day > count) return null;
    const date = `${month}-${String(day).padStart(2, '0')}`;
    return { day, date, closed: days.includes(date), sunday: i % 7 === 0 };
  });
}
