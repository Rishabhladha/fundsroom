// Design tokens — FreightLedger v3

export const COLORS = {
  navy: '#0D1B2E',
  navyLight: '#162438',
  canvas: '#F0F2F5',
  surface: '#FFFFFF',
  inkDark: '#111827',
  inkMid: '#374151',
  inkSoft: '#6B7280',
  edge: '#E5E7EB',
  violet: '#6C63FF',
  violetLight: '#EEF2FF',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  crimson: '#EF4444',
  crimsonLight: '#FEF2F2',
};

export const FONTS = {
  display: '"DM Sans", sans-serif',
  sans: '"Inter", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export const STATUS_COLORS = {
  DRAFT:     { color: '#6B7280', bg: '#F3F4F6',  border: '#E5E7EB' },
  CONFIRMED: { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  CANCELLED: { color: '#DC2626', bg: '#FEF2F2',  border: '#FECACA' },
  LEAD:      { color: '#D97706', bg: '#FFFBEB',  border: '#FDE68A' },
  ACTIVE:    { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  INACTIVE:  { color: '#9CA3AF', bg: '#F9FAFB',  border: '#E5E7EB' },
  IN:        { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  OUT:       { color: '#DC2626', bg: '#FEF2F2',  border: '#FECACA' },
};

export const TYPE_COLORS = {
  RETAIL:      { color: '#6B7280', bg: '#F3F4F6' },
  WHOLESALE:   { color: '#D97706', bg: '#FFFBEB' },
  DISTRIBUTOR: { color: '#0EA5E9', bg: '#F0F9FF' },
};
