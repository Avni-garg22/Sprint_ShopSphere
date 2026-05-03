/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: {
          100: '#fee2e2',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          100: '#fef9c3',
          600: '#ca8a04',
          700: '#a16207',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}


