// Design tokens — FundsRoom

export const COLORS = {
  navy: '#F1F5F9',
  navyLight: '#E2E8F0',
  canvas: '#E2E8F0',
  surface: '#F8FAFC',
  inkDark: '#0F172A',
  inkMid: '#334155',
  inkSoft: '#475569',
  edge: '#CBD5E1',
  violet: '#2563EB',
  violetLight: '#E0F2FE',
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
  DRAFT:     { color: '#475569', bg: '#E2E8F0',  border: '#CBD5E1' },
  CONFIRMED: { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  CANCELLED: { color: '#DC2626', bg: '#FEF2F2',  border: '#FECACA' },
  LEAD:      { color: '#D97706', bg: '#FFFBEB',  border: '#FDE68A' },
  ACTIVE:    { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  INACTIVE:  { color: '#64748B', bg: '#E2E8F0',  border: '#CBD5E1' },
  IN:        { color: '#059669', bg: '#ECFDF5',  border: '#A7F3D0' },
  OUT:       { color: '#DC2626', bg: '#FEF2F2',  border: '#FECACA' },
};

export const TYPE_COLORS = {
  RETAIL:      { color: '#475569', bg: '#E2E8F0' },
  WHOLESALE:   { color: '#D97706', bg: '#FFFBEB' },
  DISTRIBUTOR: { color: '#0EA5E9', bg: '#F0F9FF' },
};
