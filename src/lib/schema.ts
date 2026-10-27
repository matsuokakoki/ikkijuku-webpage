import { z } from 'zod';
const text = z.string().max(20000);
export const siteSchema = z.object({
  acceptance: text,
  universityLabel: text,
  highschoolLabel: text,
  universitySummary: text,
  highschoolSummary: text,
  priceNote: text,
  juniorFee: text,
  highFee: text,
  priceFooter: text,
  schedule: z.array(z.object({ label: text, value: text })),
  examples: z.array(z.object({ label: text, value: text })),
});
export const newsSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  date: z.iso.date(),
  title: text,
  body: text,
});
export const achievementSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  year: z.number().int().min(2000).max(2100),
  high: z.number().int().nonnegative(),
  ronin: z.number().int().nonnegative(),
  junior: z.number().int().nonnegative(),
  groups: z.array(
    z.object({
      label: text,
      items: z.array(
        z.object({
          school: text,
          department: text.default(''),
          count: z.number().int().nonnegative().nullable().default(null),
          note: text.default(''),
        }),
      ),
    }),
  ),
});
export const calendarSchema = z
  .object({
    id: text,
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    days: z.array(z.iso.date()),
    note: text.default(''),
    reasons: z.record(z.string(), text).default({}),
    fetchedAt: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.days.some((d) => !d.startsWith(v.month + '-')))
      ctx.addIssue({ code: 'custom', message: 'Dates must belong to the selected month' });
  });
export const contentSchema = z.object({
  site: siteSchema,
  news: z.array(newsSchema),
  achievements: z.array(achievementSchema),
  calendar: z.array(calendarSchema),
});
export type Content = z.infer<typeof contentSchema>;
