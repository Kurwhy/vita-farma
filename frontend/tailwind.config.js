/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        line: '#E2E8E8',
        surface: '#F7FAFA',
        ink: '#0F1F1E',
        muted: '#5B6B6A',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'title': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'subtitle': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['14px', { lineHeight: '1.5' }],
        'micro': ['12px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        control: '6px',
        card: '10px',
        modal: '12px',
      },
      maxWidth: {
        prose: '70ch',
      },
    },
  },
  plugins: [],
};
