/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // FreightLedger Design Tokens
        ink: '#12151B',
        'ink-raised': '#1B2029',
        steel: '#2B3240',
        paper: '#EDE6D6',
        'signal-amber': '#F2A93B',
        'ledger-green': '#3F9967',
        'rust-alert': '#C4501F',
        'slate-text': '#C7CCD6',
      },
      fontFamily: {
        // Space Grotesk — display/headers
        display: ['"Space Grotesk"', 'sans-serif'],
        // IBM Plex Sans — body/UI
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        // IBM Plex Mono — all numeric/code data
        mono: ['"IBM Plex Mono"', 'monospace'],
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
