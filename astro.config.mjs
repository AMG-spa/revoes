// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://revo.es',
  // Le pagine restano statiche; solo /api/send-order (prerender = false)
  // gira come funzione serverless per inviare l'email via Resend.
  adapter: vercel(),
  integrations: [sitemap()],
});
