export default {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0c4a6e',
          800: '#0e5c8a',
          700: '#107ba7',
          600: '#0891b2',
          500: '#06b6d4',
          100: '#e0f2fe',
          50: '#f0f9ff',
        },
        ink: '#1e293b',
      },
    },
  },
  plugins: [],
};
