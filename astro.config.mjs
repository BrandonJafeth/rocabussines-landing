// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
// ...existing code...
export default defineConfig({
  output: 'server', // En Astro actual: 'static' o 'server'
  adapter: node({
    mode: 'standalone'
  }),
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
// ...existing code...