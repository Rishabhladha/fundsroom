import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, width = '500px' }) {
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && isOpen) onClose(); },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(13, 27, 46, 0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="fixed top-0 right-0 z-50 h-full flex flex-col drawer-panel"
        style={{
          width,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-drawer, -8px 0 40px rgba(0,0,0,0.18))',
          borderLeft: '1px solid var(--edge)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--edge)' }}
        >
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--ink-dark)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--ink-soft)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas)'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </aside>
    </>
  );
}
