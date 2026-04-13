/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#050505', // Deepest black
          800: '#0a0a0a', // Background
          700: '#1a1a1a', // Card bg
          500: '#404040', // Text muted
        },
        gold: {
          100: '#F9F1D8',
          300: '#E5CFA0',
          500: '#D4AF37', // Primary Gold
          700: '#AA8C2C',
        },
        mist: {
          100: '#F5F5F5', // White text
          300: '#E0E0E0',
          500: '#9E9E9E',
        },
        cinnabar: '#8B0000', // Accent
      },
      fontFamily: {
        serif: ['Marcellus', 'Noto Serif SC', 'serif'],
        sans: ['Helvetica', 'Inter', 'Noto Sans SC', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 1s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};