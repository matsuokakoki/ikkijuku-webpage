import { test } from 'node:test';
import assert from 'node:assert/strict';
import { richText, monthCells } from '../src/lib/format';
import { contentSchema, calendarSchema } from '../src/lib/schema';
import snapshot from '../src/data/snapshot.json';
test('migrated public content validates without silently losing required editorial fields', () => {
  const c = contentSchema.parse(snapshot);
  assert.equal(c.achievements.length, 4);
  assert.equal(c.site.examples.length, 6);
  assert.ok(c.site.acceptance);
});
test('CMS rich text removes scripts, handlers and executable links', () => {
  const out = richText(
    '<p onclick="alert(1)">本文</p><script>alert(1)</script><a href="javascript:alert(1)">link</a><img src=x onerror=alert(1)><iframe src="https://evil.example"></iframe>',
  );
  assert.doesNotMatch(out, /onclick|onerror|javascript:|<script|<iframe|<img/);
  assert.match(out, /<p>本文<\/p>/);
});
test('safe formatting and HTTPS links survive', () => {
  const out = richText('<p><strong>大切な内容</strong><a href="https://example.com/">詳細</a></p>');
  assert.match(out, /<strong>/);
  assert.match(out, /href="https:\/\/example.com\/"/);
});
test('calendar uses date-only values, including leap day, without local timezone shifts', () => {
  const c = monthCells('2024-02', ['2024-02-29']);
  assert.equal(c.filter(Boolean).length, 29);
  assert.equal(c.find((x) => x?.day === 29)?.closed, true);
  assert.equal(c.find((x) => x?.day === 1)?.date, '2024-02-01');
});
test('calendar rejects impossible dates and dates outside selected month', () => {
  assert.equal(
    calendarSchema.safeParse({ id: 'x', month: '2025-02', days: ['2025-02-29'] }).success,
    false,
  );
  assert.equal(
    calendarSchema.safeParse({ id: 'x', month: '2024-02', days: ['2024-03-01'] }).success,
    false,
  );
});

import { monthPeriod, parseClosures } from '../src/lib/closures';
test('attendance API preserves JST dates and public reasons exactly', () => {
  const period = monthPeriod('2026-11');
  assert.deepEqual(period, { from: '2026-11-01', to: '2026-11-30' });
  const data = {
    version: 1,
    timezone: 'Asia/Tokyo',
    closures: [{ date: '2026-11-03', reason: '祝日' }],
  };
  assert.deepEqual(parseClosures(data, period.from, period.to), data);
  for (const date of ['2026-11-31', '2026-12-01']) {
    assert.throws(() =>
      parseClosures({ ...data, closures: [{ date, reason: '' }] }, period.from, period.to),
    );
  }
  assert.throws(() => parseClosures({ ...data, timezone: 'UTC' }, period.from, period.to));
});
