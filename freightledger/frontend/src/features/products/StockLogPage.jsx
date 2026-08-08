import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import { TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

export default function StockLogPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const canAdjust = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  // Fetch all products for selection
  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products?limit=100'),
  });

  // Fetch global stock movement log
  const { data, isLoading } = useQuery({
    queryKey: ['stock-log', page],
    queryFn: async () => {
      const productsRes = await api.get('/products?limit=100');
      const products = productsRes.data || [];

      const movPromises = products.map((p) =>
        api.get(`/products/${p.id}/movements?limit=10`).then((r) =>
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
    staleTime: 10_000,
  });

  const { mutate: addMovement, isPending } = useMutation({
    mutationFn: (payload) => api.post(`/products/${payload.productId}/movements`, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-log'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setAdjustOpen(false);
      setQuantity('');
      setReason('');
      setError(null);
    },
    onError: (err) => setError(err.message || 'Stock adjustment failed'),
  });

  function handleAdjustSubmit(e) {
    e.preventDefault();
    if (!selectedProductId || !quantity || !reason) return;
    setError(null);
    addMovement({
      productId: selectedProductId,
      body: { type, quantity: parseInt(quantity, 10), reason: reason.trim() },
    });
  }

  const movements = data?.data || [];
  const products = productsData?.data || [];

  return (
    <AppShell>
      <TopBar
        title="Stock Movement Log"
        actions={
          canAdjust && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => {
                if (products.length > 0 && !selectedProductId) setSelectedProductId(products[0].id);
                setAdjustOpen(true);
              }}
            >
              <PlusCircle size={15} />
              Adjust Stock (+ / -)
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div
          className="rounded-lg overflow-hidden border border-steel bg-ink-raised"
        >
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-slate-text/50 animate-pulse">
              Loading movements…
            </div>
          ) : movements.length === 0 ? (
            <div className="p-12 text-center text-sm italic text-slate-text/50">
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
                    <td className="px-4 py-3 font-mono text-xs text-signal-amber font-semibold">
                      {mv.product_sku}
                    </td>
                    <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">
                      {mv.product_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 font-mono text-xs font-semibold w-fit px-2 py-0.5 rounded ${
                          mv.type === 'IN' ? 'bg-ledger-green/10 text-ledger-green' : 'bg-rust-alert/10 text-rust-alert'
                        }`}
                      >
                        {mv.type === 'IN' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {mv.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-mono font-semibold text-sm ${mv.type === 'IN' ? 'text-ledger-green' : 'text-rust-alert'}`}>
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

      {/* Stock adjustment drawer */}
      <Drawer
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Record Stock Adjustment"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          {error && (
            <div className="text-xs px-3 py-2 rounded bg-rust-alert/10 text-rust-alert border border-rust-alert/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
              Select Product *
            </label>
            <select
              className="field-input font-mono text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
                Direction *
              </label>
              <select
                className="field-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="IN">IN (+ Add Stock)</option>
                <option value="OUT">OUT (- Decrease Stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                className="field-input font-mono"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              className="field-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. New supplier shipment, Damaged goods removed, Physical audit count"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? 'Recording…' : 'Record Adjustment'}
            </button>
            <button type="button" onClick={() => setAdjustOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
}
