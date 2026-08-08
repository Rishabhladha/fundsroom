// Design tokens as plain JS constants
// Import these wherever you need raw color/font values (e.g., inline styles, canvas)
// All actual styling uses the Tailwind classes defined in tailwind.config.js

export const COLORS = {
  ink: '#12151B',
  inkRaised: '#1B2029',
  steel: '#2B3240',
  paper: '#EDE6D6',
  signalAmber: '#F2A93B',
  ledgerGreen: '#3F9967',
  rustAlert: '#C4501F',
  slateText: '#C7CCD6',
};

export const FONTS = {
  display: '"Space Grotesk", sans-serif',
  sans: '"IBM Plex Sans", sans-serif',
  mono: '"IBM Plex Mono", monospace',
};

// Status → color mapping used in stamp badges
export const STATUS_COLORS = {
  // Challan statuses
  DRAFT: { color: '#C7CCD6', bg: 'rgba(199,204,214,0.08)' },
  CONFIRMED: { color: '#3F9967', bg: 'rgba(63,153,103,0.08)' },
  CANCELLED: { color: '#C4501F', bg: 'rgba(196,80,31,0.08)' },

  // Customer statuses
  LEAD: { color: '#F2A93B', bg: 'rgba(242,169,59,0.08)' },
  ACTIVE: { color: '#3F9967', bg: 'rgba(63,153,103,0.08)' },
  INACTIVE: { color: '#C7CCD6', bg: 'rgba(199,204,214,0.08)' },

  // Stock movement types
  IN: { color: '#3F9967', bg: 'rgba(63,153,103,0.08)' },
  OUT: { color: '#C4501F', bg: 'rgba(196,80,31,0.08)' },
};

// Customer type colors
export const TYPE_COLORS = {
  RETAIL: '#C7CCD6',
  WHOLESALE: '#F2A93B',
  DISTRIBUTOR: '#7CB9E8',
};
