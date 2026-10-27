import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://ikkijuku-webpage.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  security: { csp: true },
  markdown: { syntaxHighlight: false },
});
