// Design tokens as plain JS constants
// Import these wherever you need raw color/font values (e.g., inline styles, canvas)
// All actual styling uses the Tailwind classes defined in tailwind.config.js

export const COLORS = {
  ink: '#0D0E11',
  inkRaised: '#14161C',
  steel: '#282C3A',
  paper: '#F8FAFC',
  crimson: '#FF2A55',
  crimsonGlow: '#FF3366',
  signalAmber: '#FFB703',
  ledgerGreen: '#00E676',
  cyanGlow: '#00E5FF',
  rustAlert: '#FF2A55',
  slateText: '#8E95A5',
  slateBright: '#F1F5F9',
};

export const FONTS = {
  display: '"Plus Jakarta Sans", sans-serif',
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// Status → color mapping used in status badges
export const STATUS_COLORS = {
  // Challan statuses
  DRAFT: { color: '#8E95A5', bg: 'rgba(142,149,165,0.15)' },
  CONFIRMED: { color: '#00E676', bg: 'rgba(0,230,118,0.15)' },
  IN_TRANSIT: { color: '#00E5FF', bg: 'rgba(0,229,255,0.15)' },
  DELIVERED: { color: '#00E676', bg: 'rgba(0,230,118,0.15)' },
  CANCELLED: { color: '#FF2A55', bg: 'rgba(255,42,85,0.15)' },

  // Customer statuses
  LEAD: { color: '#FFB703', bg: 'rgba(255,183,3,0.15)' },
  ACTIVE: { color: '#00E676', bg: 'rgba(0,230,118,0.15)' },
  INACTIVE: { color: '#64748B', bg: 'rgba(100,116,139,0.15)' },

  // Stock movement types
  IN: { color: '#00E676', bg: 'rgba(0,230,118,0.15)' },
  OUT: { color: '#FF2A55', bg: 'rgba(255,42,85,0.15)' },
};

// Customer type colors
export const TYPE_COLORS = {
  RETAIL: '#8E95A5',
  WHOLESALE: '#FFB703',
  DISTRIBUTOR: '#00E5FF',
};
