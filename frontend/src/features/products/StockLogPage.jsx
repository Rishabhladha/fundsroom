import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import SearchInput from '../../components/ui/SearchInput';
import { TrendingUp, TrendingDown, PlusCircle, FilterX, Search, Info } from 'lucide-react';

export default function StockLogPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterProductName, setFilterProductName] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const canAdjust = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products?limit=200'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock-log', page, search, filterProductId],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 25 });
      if (search) params.append('search', search);
      if (filterProductId) params.append('productId', filterProductId);
      return api.get(`/stock-movements?${params.toString()}`);
    },
    staleTime: 15_000,
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

  useEffect(() => { setPage(1); }, [search, filterProductId]);

  const movements = data?.data || [];
  const products = productsData?.data || [];

  function handleAdjustSubmit(e) {
    e.preventDefault();
    if (!selectedProductId || !quantity || !reason) return;
    setError(null);
    addMovement({ productId: selectedProductId, body: { type, quantity: parseInt(quantity, 10), reason: reason.trim() } });
  }

  function clearFilter() { setFilterProductId(''); setFilterProductName(''); }

  return (
    <AppShell>
      <TopBar
        title="Stock Movement Log"
        actions={canAdjust && (
          <button
            className="btn btn-primary"
            onClick={() => { if (products.length && !selectedProductId) setSelectedProductId(products[0].id); setAdjustOpen(true); }}
          >
            <PlusCircle size={14} strokeWidth={2.5} />
            Adjust Stock
          </button>
        )}
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Filters */}
        <div className="card flex items-center gap-3 p-3 mb-4 flex-wrap">
          <SearchInput placeholder="Search product name or SKU…" value={search} onChange={setSearch} />
          {filterProductId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--violet-light)', color: 'var(--violet)', border: '1px solid #BFDBFE' }}>
              <span>Filtered by: {filterProductName}</span>
              <button onClick={clearFilter} className="hover:opacity-70 transition-opacity">
                <FilterX size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-4 w-full" />)}
            </div>
          ) : movements.length === 0 ? (
            <div className="p-14 text-center text-sm italic" style={{ color: 'var(--ink-muted)' }}>
              No stock movements found.
            </div>
          ) : (
            <table className="w-full ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Direction</th>
                  <th className="text-right">Qty</th>
                  <th>Reason / Ref</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((mv) => (
                  <tr key={mv.id}>
                    <td className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                      {new Date(mv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>
                        {mv.product_sku}
                      </span>
                    </td>
                    <td>
                      <button
                        className="group relative inline-flex items-center gap-1.5 text-sm font-semibold text-left px-2 py-1 rounded-lg transition-all"
                        style={{ color: 'var(--ink-dark)' }}
                        onClick={() => { setFilterProductId(mv.product_id); setFilterProductName(mv.product_name); }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--violet-light)'; e.currentTarget.style.color = 'var(--violet)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
                        title="Click to view history for this product"
                      >
                        <span>{mv.product_name}</span>
                        <Search size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--violet)' }} />
                      </button>
                    </td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={mv.type === 'IN'
                          ? { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }
                          : { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }
                        }
                      >
                        {mv.type === 'IN' ? <TrendingUp size={10} strokeWidth={2.5} /> : <TrendingDown size={10} strokeWidth={2.5} />}
                        {mv.type}
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold text-sm" style={{ color: mv.type === 'IN' ? '#059669' : '#EF4444' }}>
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                    </td>
                    <td className="text-sm max-w-xs truncate" style={{ color: 'var(--ink-soft)' }} title={mv.reason}>
                      {mv.reason}
                    </td>
                    <td className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>{mv.created_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>

      {/* Adjustment Drawer */}
      <Drawer isOpen={adjustOpen} onClose={() => setAdjustOpen(false)} title="Record Stock Adjustment">
        <form onSubmit={handleAdjustSubmit} className="space-y-5">
          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>Product *</label>
            <select className="field-input font-mono text-sm" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.sku} — {p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>Direction *</label>
              <select className="field-input" value={type} onChange={e => setType(e.target.value)}>
                <option value="IN">IN — Add Stock</option>
                <option value="OUT">OUT — Remove Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>Quantity *</label>
              <input type="number" min="1" required className="field-input font-mono" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 25" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>Reason / Reference *</label>
            <input type="text" required className="field-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. New supplier shipment, Audit correction…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending} className="btn btn-primary flex-1">
              {isPending ? 'Recording…' : 'Record Adjustment'}
            </button>
            <button type="button" onClick={() => setAdjustOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
}
