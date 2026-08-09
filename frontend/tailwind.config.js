/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Nav / chrome
        navy: '#0D1B2E',
        'navy-light': '#162438',
        'navy-border': '#1E3148',
        // Content surfaces — off-white, not glaring
        canvas: '#ECEEF2',
        surface: '#F5F6F8',
        'surface-2': '#EDEFF3',
        'surface-alt': '#E8EAF0',
        // Text
        'ink-dark': '#1A2033',
        'ink-mid': '#3D4663',
        'ink-soft': '#6B728A',
        'ink-muted': '#9BA3B8',
        // Borders
        edge: '#DDE1EC',
        'edge-strong': '#C8CEDF',
        // Brand
        violet: '#6C63FF',
        'violet-light': '#ECEEFF',
        'violet-dark': '#4F46E5',

        // Status colors
        emerald: '#10B981',
        'emerald-light': '#ECFDF5',
        amber: '#F59E0B',
        'amber-light': '#FFFBEB',
        crimson: '#EF4444',
        'crimson-light': '#FEF2F2',
        sky: '#0EA5E9',
        'sky-light': '#F0F9FF',
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'drawer': '-8px 0 40px rgba(0,0,0,0.18)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
