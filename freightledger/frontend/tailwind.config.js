/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // FreightLedger — Charcoal Slate & Crimson Pulse Theme
        ink: '#0D0E11',
        'ink-raised': '#14161C',
        'ink-card': '#1A1D26',
        steel: '#282C3A',
        'steel-light': '#363B4E',
        paper: '#F8FAFC',
        crimson: '#FF2A55',
        'crimson-glow': '#FF3366',
        'signal-amber': '#FFB703',
        'ledger-green': '#00E676',
        'cyan-glow': '#00E5FF',
        'rust-alert': '#FF2A55',
        'slate-text': '#8E95A5',
        'slate-bright': '#F1F5F9',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'stamp-impact': 'stampImpact 150ms ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        stampImpact: {
          '0%':   { transform: 'scale(1.15)', opacity: '0.6' },
          '70%':  { transform: 'scale(0.97)', opacity: '1' },
          '100%': { transform: 'scale(1.0)', opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'crimson-glow': '0 0 20px rgba(255, 42, 85, 0.3)',
        'amber-glow': '0 0 20px rgba(255, 183, 3, 0.3)',
        'emerald-glow': '0 0 20px rgba(0, 230, 118, 0.3)',
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
