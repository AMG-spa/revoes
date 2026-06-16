// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://revo.es',
  // Pages stay static; only routes that opt out with `prerender = false`
  // (the Stripe API endpoints) run on Vercel's serverless runtime.
  adapter: vercel(),
  integrations: [sitemap()],
});
