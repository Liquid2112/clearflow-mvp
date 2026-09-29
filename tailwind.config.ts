import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep ink / navy base — the grounding, trustworthy tone.
        ink: {
          DEFAULT: '#0d1b2a',
          900: '#0d1b2a',
          800: '#16283b',
          700: '#22384f',
          600: '#3a5064',
          500: '#5b7085',
          400: '#8497a8',
          300: '#b4c1cd',
          200: '#d7dfe6',
          100: '#eef2f5',
          50: '#f6f9fb',
        },
        // Primary water accent — fresh teal/aqua. This is the brand's "flow".
        brand: {
          900: '#0b3f47',
          800: '#0d5560',
          700: '#0f7181',
          600: '#12909f',
          500: '#17b0bd',
          400: '#3fc9d3',
          300: '#7bdde3',
          200: '#b3edf0',
          100: '#dff7f8',
          50: '#f0fbfc',
        },
        // Warm secondary accent — a sandy amber to break the monochrome-blue tell
        // and signal "test / caution / warmth" moments.
        ember: {
          900: '#7c2d12',
          800: '#9a3412',
          700: '#c2410c',
          600: '#ea580c',
          500: '#f97316',
          400: '#fb923c',
          300: '#fdba74',
          200: '#fed7aa',
          100: '#ffedd5',
          50: '#fff7ed',
        },
      },
      fontFamily: {
        // Wired up by next/font in layout.tsx via CSS variables.
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 27, 42, 0.04), 0 8px 24px -12px rgba(13, 27, 42, 0.18)',
        lift: '0 2px 4px rgba(13, 27, 42, 0.05), 0 24px 48px -18px rgba(13, 27, 42, 0.28)',
        ring: '0 0 0 4px rgba(23, 176, 189, 0.12)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(60% 55% at 15% 10%, rgba(23,176,189,0.14) 0%, rgba(23,176,189,0) 60%), radial-gradient(50% 50% at 90% 5%, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0) 55%), radial-gradient(65% 60% at 80% 90%, rgba(13,85,96,0.10) 0%, rgba(13,85,96,0) 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
