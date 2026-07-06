export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#14467d',
        secondary: '#71ba65',
        tertiary: '#d97706',
        'background-light': '#f4f5f7',
        'surface-light': '#ffffff',
        'text-light': '#334155',
        'on-surface-variant': '#64748b'
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.08)',
        strong: '0 12px 28px rgba(15, 23, 42, 0.14)'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
