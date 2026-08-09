import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: '1px solid var(--edge)' }}
    >
      <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
        {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--ink-soft)' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--canvas)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="w-8 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-8 h-8 rounded-lg font-mono text-sm font-medium transition-all"
              style={
                p === page
                  ? { background: 'var(--violet)', color: '#fff', fontWeight: 600 }
                  : { color: 'var(--ink-soft)' }
              }
              onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'var(--canvas)'; }}
              onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent'; }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--ink-soft)' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'var(--canvas)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
