import { useState } from 'react';
import { useStockMovements, useAddMovement } from './useProducts';
import Drawer from '../../components/ui/Drawer';
import Pagination from '../../components/ui/Pagination';
import StatusStamp from '../../components/ui/StatusStamp';
import { TrendingUp, TrendingDown, Edit, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// StockMovementLog — slide-in drawer showing movement history + adjust form
// ─────────────────────────────────────────────────────────────────────────────

export default function StockMovementLog({ product, canAdjust, onClose, onEdit }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStockMovements(product.id, { page, limit: 15 });
  const { mutate: addMovement, isPending } = useAddMovement(product.id);

  const [adjForm, setAdjForm] = useState({ type: 'IN', quantity: '', reason: '' });
  const [adjError, setAdjError] = useState(null);
  const [showAdj, setShowAdj] = useState(false);

  function handleAdjust(e) {
    e.preventDefault();
    setAdjError(null);
    addMovement(
      { ...adjForm, quantity: parseInt(adjForm.quantity) },
      {
        onSuccess: () => {
          setAdjForm({ type: 'IN', quantity: '', reason: '' });
          setShowAdj(false);
        },
        onError: (err) => setAdjError(err.message || 'Adjustment failed'),
      }
    );
  }

  const movements = data?.data || [];

  return (
    <Drawer isOpen onClose={onClose} title={`Stock Log — ${product.sku}`} width="520px">
      {/* Product summary */}
      <div
        className="rounded-lg p-4 mb-5"
        style={{ backgroundColor: '#12151B', border: '1px solid #2B3240' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-semibold text-white">{product.name}</div>
            <div className="font-mono text-xs mt-1" style={{ color: '#F2A93B' }}>{product.sku}</div>
          </div>
          <div className="text-right">
            <div
              className="font-mono font-bold text-2xl"
              style={{ color: product.low_stock ? '#F2A93B' : '#3F9967' }}
            >
              {product.stock}
            </div>
            <div className="text-xs font-mono text-slate-text/50">in stock</div>
          </div>
        </div>

        {product.low_stock && (
          <div
            className="mt-3 flex items-center gap-2 text-xs font-mono px-3 py-2 rounded"
            style={{ backgroundColor: 'rgba(242,169,59,0.08)', color: '#F2A93B', border: '1px solid rgba(242,169,59,0.2)' }}
          >
            <AlertTriangle size={12} />
            Below minimum stock ({product.min_stock})
          </div>
        )}

        {canAdjust && (
          <div className="flex gap-2 mt-3">
            <button
              className="btn-ghost text-xs flex items-center gap-1.5 flex-1"
              onClick={() => setShowAdj(!showAdj)}
            >
              <TrendingUp size={13} />
              {showAdj ? 'Hide Adjustment' : 'Adjust Stock'}
            </button>
            <button
              className="btn-ghost text-xs flex items-center gap-1.5"
              onClick={onEdit}
            >
              <Edit size={13} />
              Edit Product
            </button>
          </div>
        )}
      </div>

      {/* Manual adjustment form */}
      {showAdj && canAdjust && (
        <form
          onSubmit={handleAdjust}
          className="rounded-lg p-4 mb-5 space-y-4"
          style={{ backgroundColor: '#12151B', border: '1px solid #2B3240' }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
            Manual Stock Adjustment
          </div>

          {adjError && (
            <div className="text-xs px-3 py-2 rounded" style={{ backgroundColor: 'rgba(196,80,31,0.1)', color: '#C4501F' }}>
              {adjError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-text/50 mb-1">Direction</label>
              <select
                className="field-input"
                value={adjForm.type}
                onChange={e => setAdjForm(p => ({ ...p, type: e.target.value }))}
              >
                <option value="IN">IN (Add Stock)</option>
                <option value="OUT">OUT (Remove Stock)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-text/50 mb-1">Quantity</label>
              <input
                className="field-input font-mono"
                type="number"
                min="1"
                required
                value={adjForm.quantity}
                onChange={e => setAdjForm(p => ({ ...p, quantity: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-text/50 mb-1">Reason *</label>
            <input
              className="field-input"
              required
              value={adjForm.reason}
              onChange={e => setAdjForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Damaged in transit, physical count correction…"
            />
          </div>

          <button type="submit" disabled={isPending} className="btn-primary w-full text-sm">
            {isPending ? 'Saving…' : 'Record Adjustment'}
          </button>
        </form>
      )}

      {/* Movement history */}
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
        Movement History
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-steel rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-steel rounded w-3/4" />
                <div className="h-3 bg-steel/50 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="py-8 text-center text-sm italic" style={{ color: '#4A5568' }}>
          No stock movements recorded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((mv) => (
            <div
              key={mv.id}
              className="flex gap-3 items-start p-3 rounded"
              style={{ backgroundColor: '#12151B', border: '1px solid #1F2633' }}
            >
              {/* Direction icon */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: mv.type === 'IN' ? 'rgba(63,153,103,0.1)' : 'rgba(196,80,31,0.1)',
                  color: mv.type === 'IN' ? '#3F9967' : '#C4501F',
                }}
              >
                {mv.type === 'IN' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className="font-mono font-semibold text-sm"
                    style={{ color: mv.type === 'IN' ? '#3F9967' : '#C4501F' }}
                  >
                    {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                  </span>
                  <span className="font-mono text-xs" style={{ color: '#4A5568' }}>
                    {new Date(mv.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="text-xs text-slate-text/70 truncate">{mv.reason}</div>
                <div className="text-xs font-mono mt-0.5" style={{ color: '#4A5568' }}>
                  by {mv.created_by_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />
    </Drawer>
  );
}
