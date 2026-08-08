// Design tokens as plain JS constants
// Import these wherever you need raw color/font values (e.g., inline styles, canvas)
// All actual styling uses the Tailwind classes defined in tailwind.config.js

export const COLORS = {
  ink: '#090D16',
  inkRaised: '#121824',
  steel: '#1F2937',
  paper: '#F3F4F6',
  signalAmber: '#F59E0B',
  ledgerGreen: '#10B981',
  rustAlert: '#F43F5E',
  slateText: '#D1D5DB',
};

export const FONTS = {
  display: '"Plus Jakarta Sans", sans-serif',
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// Status → color mapping used in stamp badges
export const STATUS_COLORS = {
  // Challan statuses
  DRAFT: { color: '#D1D5DB', bg: 'rgba(209,213,219,0.1)' },
  CONFIRMED: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  CANCELLED: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },

  // Customer statuses
  LEAD: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ACTIVE: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  INACTIVE: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' },

  // Stock movement types
  IN: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  OUT: { color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
};

// Customer type colors
export const TYPE_COLORS = {
  RETAIL: '#9CA3AF',
  WHOLESALE: '#F59E0B',
  DISTRIBUTOR: '#38BDF8',
};
