/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Nav / chrome — warm off-white slate
        navy: '#F1F5F9',
        'navy-light': '#E2E8F0',
        'navy-border': '#CBD5E1',
        // Content surfaces
        canvas: '#E2E8F0',
        surface: '#F8FAFC',
        'surface-2': '#E2E8F0',
        'surface-alt': '#CBD5E1',
        // Text
        'ink-dark': '#0F172A',
        'ink-mid': '#334155',
        'ink-soft': '#475569',
        'ink-muted': '#64748B',
        // Borders
        edge: '#CBD5E1',
        'edge-strong': '#94A3B8',
        // Brand accent — Royal Steel Blue
        violet: '#2563EB',
        'violet-light': '#E0F2FE',
        'violet-dark': '#1D4ED8',

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
        'card': '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'drawer': '-8px 0 40px rgba(0,0,0,0.15)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
