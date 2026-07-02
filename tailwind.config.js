/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#0D0B61',
          secondary: '#294669',
          tertiary:  '#478B8D',
          accent:    '#E4D329',
        },
        surface: {
          950: '#04032E',
          900: '#08063D',
          800: '#0D0B61',
          700: '#161478',
          600: '#1F1D8C',
          500: '#2E2CA0',
          400: '#4A48B8',
          300: '#7876C8',
          200: '#A8A6D8',
          100: '#D5D4F0',
          50:  '#EDEDFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
