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
      style={{ display: 'inline-flex' }}
    >
      <span
        style={{
          color: config.color,
          borderColor: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.color}`,
          borderRadius: '6px',
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: large ? '8px 20px' : '4px 12px',
          fontSize: large ? '14px' : '11px',
        }}
      >
        {status}
      </span>
    </div>
  );
}
