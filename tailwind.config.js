
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        yellow: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        coral: {
          400: '#FB923C',
          500: '#F97316',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
        },
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          500: '#6B7280',
          900: '#111827',
        }
      },
      boxShadow: {
        'chunky-green': '0 6px 0 0 #059669',
        'chunky-yellow': '0 6px 0 0 #D97706',
        'chunky-coral': '0 6px 0 0 #C2410C',
        'chunky-blue': '0 6px 0 0 #1D4ED8',
        'chunky-gray': '0 6px 0 0 #4B5563',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
