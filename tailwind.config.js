/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        fire: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#E63946',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        ocean: {
          50: '#F1FAFC',
          100: '#E0F2F7',
          200: '#B9E0EC',
          300: '#86C7DA',
          400: '#4EA8C4',
          500: '#1D3557',
          600: '#1A2F4C',
          700: '#16273E',
          800: '#121F31',
          900: '#0F1928',
        },
        warn: {
          400: '#F6B26B',
          500: '#F4A261',
          600: '#E78B4A',
        },
        success: {
          400: '#3DB4A4',
          500: '#2A9D8F',
          600: '#248579',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(29, 53, 87, 0.12)',
        'card-hover': '0 12px 40px -12px rgba(230, 57, 70, 0.25)',
        fire: '0 8px 28px -8px rgba(230, 57, 70, 0.35)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'grow': 'grow 1s ease-out both',
        'check': 'check 0.6s ease-in-out both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        grow: {
          '0%': { width: '0%' },
        },
        check: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
