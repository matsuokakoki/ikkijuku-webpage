# 一輝塾 website

- Stack: Astro static output, TypeScript, microCMS Hobby, Cloudflare Pages Free. No paid services or upgrades.
- The target repository is `matsuokakoki/ikkijuku-webpage`. Do not modify the legacy attendance system or its Firestore rules.
- Preserve the original visual identity, including `Hero.astro`'s two-part falling logo. Respect reduced-motion preferences.
- Teacher-editable scope is exactly the previous Firebase editors: news/date, acceptance, schedule, fees and examples, achievement summaries/headings, annual school results and student counts. Closures come exclusively from the attendance public API (Cloudflare D1 calendar); never edit or duplicate them in CMS. Other copy/layout is in code.
- Before changes, read `docs/architecture.md` and `docs/editor-guide.md`.
- Credentials belong in ignored `.env` or Cloudflare secrets only. Never print them or commit them. Browser output contains no CMS key, Firebase SDK, or direct database access.
- `npm ci`; `npm run check`; `npm test`; `npm run build`; `npm run test:e2e`.
- Public routes are statically generated. CMS failures must fail the build, preserving the last successful deployment. Never silently substitute old prices in CMS mode.
- `CONTENT_SOURCE=snapshot` is the explicitly selected migration/development mode. Production uses `CONTENT_SOURCE=microcms`.
- Keep the three editorial APIs within the 5-API Hobby quota (the initial news template also created `categories`). Schema definitions live in `scripts/cms-models.mjs`.
- The CMS rich-text boundary is `richText()`; never render arbitrary CMS HTML without sanitizing it.
- Preserve date-only values and use Asia/Tokyo for publication dates. Counts omitted in legacy data remain omitted, not zero.
- Run only meaningful tests and fix observed failures. Do not add runtime infrastructure without a concrete need.

- Closure API: preserve exact JST date strings, always mark Sundays closed, cache successes for five minutes, and keep the last successful display on network/schema failure. Only public data may be cached in the browser.
