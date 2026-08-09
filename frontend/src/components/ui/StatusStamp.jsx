import { STATUS_COLORS } from '../../theme/tokens';

export default function StatusStamp({ status }) {
  const config = STATUS_COLORS[status] || { color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
  return (
    <span
      className="stamp-badge"
      style={{ color: config.color, background: config.bg, borderColor: config.border }}
    >
      {status}
    </span>
  );
}
