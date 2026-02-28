// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Páginas estáticas por defecto + endpoints dinámicos con prerender: false
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
  ],
});