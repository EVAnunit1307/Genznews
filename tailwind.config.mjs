/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Instrument Serif"', 'serif'],
        body: ['Barlow', 'sans-serif'],
      },
      colors: {
        // #ff2d2d "LIVE" accent — use text-live / bg-live / border-live
        live: '#ff2d2d',
      },
      borderRadius: {
        DEFAULT: '9999px',
      },
    },
  },
  plugins: [],
};
