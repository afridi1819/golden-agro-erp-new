/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8e8',
          100: '#f9ecc2',
          200: '#f2dc8a',
          300: '#e8c84d',
          400: '#D4AF37',
          500: '#C5A028',
          600: '#B8960F',
          700: '#9a7b0c',
          800: '#7d630e',
          900: '#665210',
        },
        theme: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          border: '#333333',
          muted: '#888888',
          gold: '#D4AF37',
        }
      }
    },
  },
  plugins: [],
}