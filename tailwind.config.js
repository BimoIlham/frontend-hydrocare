/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ─── HydroCare Glass-White Elegant Blue Palette ───
        dark: {
          900: '#f0f4f8',
          800: '#f5f7fa',
          700: '#ffffff',
          600: '#e8edf2',
          500: '#dbe2ea',
          400: '#c8d3df',
          300: '#b0bec9',
        },
        teal: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // primary — sky blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4', // accent
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.55)',
          border: 'rgba(255, 255, 255, 0.6)',
          hover: 'rgba(255, 255, 255, 0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl:   '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'glow-teal':  '0 0 20px rgba(14, 165, 233, 0.20)',
        'glow-cyan':  '0 0 20px rgba(6, 182, 212, 0.20)',
        'glow-sm':    '0 0 10px rgba(14, 165, 233, 0.15)',
        'card':       '0 4px 24px rgba(14, 165, 233, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(14, 165, 233, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'glass':      '0 8px 32px rgba(14, 165, 233, 0.08), 0 2px 12px rgba(0, 0, 0, 0.04)',
        'nav':        '0 4px 30px rgba(14, 165, 233, 0.06), 0 1px 8px rgba(0, 0, 0, 0.03)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translate(-50%, 100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(14, 165, 233, 0.15)' },
          '50%':      { boxShadow: '0 0 30px rgba(14, 165, 233, 0.30)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.5s ease-out forwards',
        'slide-up':   'slide-up 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}