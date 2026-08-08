import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Pagination from '../../components/ui/Pagination';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// StockLogPage — global stock movement log across all products
// Queries each product's movements (ADMIN/WAREHOUSE/ACCOUNTS can view)
// ─────────────────────────────────────────────────────────────────────────────

export default function StockLogPage() {
  const [page, setPage] = useState(1);

  // Fetch all products, then show a global movement view
  // We use a dedicated approach: get all movements by querying products and aggregating
  // For simplicity, show movements from all products ordered by time
  const { data, isLoading } = useQuery({
    queryKey: ['stock-log', page],
    queryFn: async () => {
      // Fetch all products to get their IDs, then we display a unified log
      // Real-world: a /api/movements endpoint would be better — for this project
      // we compose from available endpoints
      const productsRes = await api.get('/products?limit=100');
      const products = productsRes.data || [];

      // Fetch recent movements for all products in parallel (first 10)
      const movPromises = products.slice(0, 10).map((p) =>
        api.get(`/products/${p.id}/movements?limit=5`).then((r) =>
          (r.data || []).map((m) => ({ ...m, product_name: p.name, product_sku: p.sku }))
        )
      );

      const movArrays = await Promise.all(movPromises);
      const allMov = movArrays
        .flat()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return {
        data: allMov.slice((page - 1) * 20, page * 20),
        meta: { total: allMov.length, page, limit: 20, totalPages: Math.ceil(allMov.length / 20) },
      };
    },
    staleTime: 15_000,
  });

  const movements = data?.data || [];

  return (
    <AppShell>
      <TopBar title="Stock Movement Log" />

      <div className="flex-1 overflow-auto p-6">
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
        >
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-slate-text/50 animate-pulse">
              Loading movements…
            </div>
          ) : movements.length === 0 ? (
            <div className="p-12 text-center text-sm italic" style={{ color: '#4A5568' }}>
              No stock movements recorded yet.
            </div>
          ) : (
            <table className="w-full ledger-table">
              <thead>
                <tr className="border-b border-steel">
                  {['Date', 'SKU', 'Product', 'Direction', 'Qty', 'Reason', 'By'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((mv) => (
                  <tr key={mv.id} className="border-b border-steel/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-text/60">
                      {new Date(mv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#F2A93B' }}>
                      {mv.product_sku}
                    </td>
                    <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">
                      {mv.product_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="flex items-center gap-1.5 font-mono text-xs font-semibold w-fit"
                        style={{ color: mv.type === 'IN' ? '#3F9967' : '#C4501F' }}
                      >
                        {mv.type === 'IN' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {mv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-sm"
                      style={{ color: mv.type === 'IN' ? '#3F9967' : '#C4501F' }}
                    >
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-text/70 max-w-[250px] truncate">
                      {mv.reason}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-text/50">
                      {mv.created_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>
    </AppShell>
  );
}
