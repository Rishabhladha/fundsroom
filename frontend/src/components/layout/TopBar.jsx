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
        background: 'var(--navy)',
        borderBottom: '1px solid var(--navy-border)',
      }}
    >
      {/* Page title */}
      <h1 className="font-display font-semibold text-base" style={{ color: '#E2E8F5', letterSpacing: '-0.01em' }}>
        {title}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Low-stock warning */}
        {lowStockCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <AlertTriangle size={12} strokeWidth={2.5} />
            <span>{lowStockCount} low stock</span>
          </div>
        )}

        {/* Role chip */}
        {user && (
          <div
            className="font-mono text-[11px] px-2.5 py-1 rounded-lg font-medium"
            style={{ background: 'rgba(108,99,255,0.18)', color: '#A5A0FF', border: '1px solid rgba(108,99,255,0.3)' }}
          >
            {user.role}
          </div>
        )}
      </div>
    </header>
  );
}
