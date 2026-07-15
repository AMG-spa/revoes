// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://revosrl.es',
  // Le pagine restano statiche; solo /api/send-order (prerender = false)
  // gira come funzione serverless per inviare l'email via Resend.
  adapter: vercel(),
  integrations: [sitemap()],
  redirects: {
    // Vecchio slug del servizio, rinominato in "activacion-garantia-telematica".
    '/servicios/instalacion-telematica': {
      status: 301,
      destination: '/servicios/activacion-garantia-telematica',
    },
  },
});
