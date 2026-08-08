import { STATUS_COLORS } from '../../theme/tokens';
import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// StampBadge — the signature challan status stamp with impact animation
// Used on ChallanDetailPage; animates once when status changes to CONFIRMED.
// ─────────────────────────────────────────────────────────────────────────────

export default function StampBadge({ status, large = false }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  const [animating, setAnimating] = useState(false);
  const prevStatus = useRef(status);

  useEffect(() => {
    // Fire animation when transitioning to CONFIRMED
    if (status === 'CONFIRMED' && prevStatus.current !== 'CONFIRMED') {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 250);
      prevStatus.current = status;
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  return (
    <div
      className={`inline-flex items-center justify-center ${animating ? 'animate-stamp-impact' : ''}`}
      style={{
        transform: 'rotate(-4deg)',
        display: 'inline-flex',
      }}
    >
      <span
        style={{
          color: config.color,
          borderColor: config.color,
          backgroundColor: config.bg,
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 0 1px ${config.color} inset`,
          borderRadius: '4px',
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: large ? '8px 24px' : '4px 14px',
          fontSize: large ? '18px' : '12px',
        }}
      >
        {status}
      </span>
    </div>
  );
}
