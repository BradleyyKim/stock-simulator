/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        stock: {
          up: '#ef4444',
          down: '#3b82f6',
          neutral: '#6b7280',
        },
        sector: {
          ai: '#8b5cf6',
          energy: '#f59e0b',
          bio: '#10b981',
          semi: '#3b82f6',
          game: '#ec4899',
        },
      },
    },
  },
  plugins: [],
};
