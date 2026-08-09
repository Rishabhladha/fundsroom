import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function TopBar({ title, actions }) {
  const { user } = useAuthStore();

  const { data: lowStockData } = useQuery({
    queryKey: ['products', 'lowStock'],
    queryFn: () => api.get('/products?lowStock=true&limit=100'),
    staleTime: 60_000,
  });

  const lowStockCount = lowStockData?.meta?.total || 0;

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: '56px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--edge)',
      }}
    >
      {/* Page title */}
      <h1 className="font-display font-semibold text-base" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Low-stock warning */}
        {lowStockCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
          >
            <AlertTriangle size={12} strokeWidth={2.5} />
            <span>{lowStockCount} low stock</span>
          </div>
        )}

        {/* Role chip */}
        {user && (
          <div
            className="font-mono text-[11px] px-2.5 py-1 rounded-lg font-medium"
            style={{ background: '#E0F2FE', color: '#2563EB', border: '1px solid #BAE6FD' }}
          >
            {user.role}
          </div>
        )}
      </div>
    </header>
  );
}
