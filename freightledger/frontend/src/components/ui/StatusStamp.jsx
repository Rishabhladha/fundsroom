import { STATUS_COLORS } from '../../theme/tokens';
import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// StatusStamp — the signature FreightLedger rubber-stamp badge
//
// Renders a slightly rotated, double-outlined stamp in the relevant color
// on a paper chip — mimicking an ink stamp on a physical dispatch docket.
//
// When `animate` prop changes to true, plays the stamp-impact animation once.
// ─────────────────────────────────────────────────────────────────────────────

export default function StatusStamp({ status, animate = false }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  const [isAnimating, setIsAnimating] = useState(false);
  const prevAnimate = useRef(false);

  useEffect(() => {
    // Only trigger animation when animate transitions false → true
    if (animate && !prevAnimate.current) {
      setIsAnimating(true);
      const t = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(t);
    }
    prevAnimate.current = animate;
  }, [animate]);

  return (
    <span
      className={`stamp-badge ${isAnimating ? 'animating' : ''}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.color,
      }}
    >
      {status}
    </span>
  );
}
