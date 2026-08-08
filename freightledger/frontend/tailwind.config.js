/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // FreightLedger Cyber-Industrial Theme (Zero Purple)
        ink: '#070B12',
        'ink-raised': '#0E1626',
        'ink-card': '#141E30',
        steel: '#1E2D45',
        'steel-light': '#2A3E5E',
        paper: '#F8FAFC',
        'emerald-glow': '#00F5A0',
        'ledger-green': '#10B981',
        'cyan-glow': '#00E5FF',
        'signal-amber': '#FFB800',
        'rust-alert': '#FF355E',
        'slate-text': '#94A3B8',
        'slate-bright': '#E2E8F0',
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
        'emerald-glow': '0 0 20px rgba(0, 245, 160, 0.25)',
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.25)',
        'amber-glow': '0 0 20px rgba(255, 184, 0, 0.25)',
        'crimson-glow': '0 0 20px rgba(255, 53, 94, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
