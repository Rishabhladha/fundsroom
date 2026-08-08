/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // FreightLedger Modern High-Contrast Industrial Palette
        ink: '#090D16',
        'ink-raised': '#121824',
        steel: '#1F2937',
        paper: '#F3F4F6',
        'signal-amber': '#F59E0B',
        'ledger-green': '#10B981',
        'rust-alert': '#F43F5E',
        'slate-text': '#D1D5DB',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'stamp-impact': 'stampImpact 150ms ease-out forwards',
        'drawer-in': 'drawerIn 200ms ease-out forwards',
        'drawer-out': 'drawerOut 200ms ease-in forwards',
        'fade-in': 'fadeIn 150ms ease-out',
      },
      keyframes: {
        stampImpact: {
          '0%':   { transform: 'rotate(-4deg) scale(1.15)' },
          '70%':  { transform: 'rotate(-4deg) scale(0.97)' },
          '100%': { transform: 'rotate(-4deg) scale(1.0)' },
        },
        drawerIn: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        drawerOut: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'drawer': '-4px 0 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
