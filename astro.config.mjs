// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.rocabusiness.net',
  output: 'server', // Server-Side Rendering para datos dinámicos de Supabase
  adapter: vercel({}),
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  integrations: [
    react(),
    tailwind(),
    sitemap(),
  ],
});