import { Bell, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// TopBar — module title, low-stock alert badge, user role chip
// ─────────────────────────────────────────────────────────────────────────────

export default function TopBar({ title, actions }) {
  const { user } = useAuthStore();

  // Check for low-stock items — shows a warning badge
  const { data: lowStockData } = useQuery({
    queryKey: ['products', 'lowStock'],
    queryFn: () => api.get('/products?lowStock=true&limit=100'),
    staleTime: 60_000,
  });

  const lowStockCount = lowStockData?.meta?.total || 0;

  return (
    <header
      className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0"
      style={{ borderColor: '#2B3240', backgroundColor: '#1B2029' }}
    >
      {/* Left: page title */}
      <h1 className="font-display font-semibold text-base text-white tracking-wide">
        {title}
      </h1>

      {/* Right: actions slot + low-stock bell + role chip */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Low-stock warning */}
        {lowStockCount > 0 && (
          <button
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(242,169,59,0.1)',
              color: '#F2A93B',
              border: '1px solid rgba(242,169,59,0.2)',
            }}
            title={`${lowStockCount} product(s) below minimum stock`}
          >
            <AlertTriangle size={13} />
            <span className="font-mono">{lowStockCount} low stock</span>
          </button>
        )}

        {/* Role badge */}
        {user && (
          <span
            className="font-mono text-xs px-2.5 py-1 rounded"
            style={{
              backgroundColor: '#2B3240',
              color: '#C7CCD6',
              letterSpacing: '0.08em',
            }}
          >
            {user.role}
          </span>
        )}
      </div>
    </header>
  );
}
