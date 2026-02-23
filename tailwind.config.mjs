/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        deepest: '#0B2545',
        primary: '#134074',
        dark: '#13315C',
        mid: '#8DA9C4',
        light: '#ffffff',
        success: '#2D9E6B',
        error: '#D64045',
      },
      fontFamily: {
        heading: ['Sansation', 'sans-serif'],
        body: ['Sansation', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
