import { useState } from 'react';
import { useStockMovements, useAddMovement } from './useProducts';
import Drawer from '../../components/ui/Drawer';
import Pagination from '../../components/ui/Pagination';
import { TrendingUp, TrendingDown, Edit3, AlertTriangle, Plus } from 'lucide-react';

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
    <Drawer isOpen onClose={onClose} title={`Stock Details — ${product.sku}`} width="520px">
      {/* Product summary card */}
      <div className="card p-5 mb-5" style={{ background: 'var(--surface-2)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-bold text-base" style={{ color: 'var(--ink-dark)' }}>{product.name}</div>
            <div className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md inline-block mt-1" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>
              {product.sku}
            </div>
            {product.category && (
              <div className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Category: {product.category}</div>
            )}
          </div>
          <div className="text-right">
            <div
              className="font-mono font-bold text-2xl"
              style={{ color: product.low_stock ? '#D97706' : product.stock === 0 ? '#EF4444' : '#10B981' }}
            >
              {product.stock}
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>units in stock</div>
          </div>
        </div>

        {product.low_stock && (
          <div
            className="mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
          >
            <AlertTriangle size={13} strokeWidth={2.5} />
            Below minimum stock alert ({product.min_stock} min required)
          </div>
        )}

        {canAdjust && (
          <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--edge)' }}>
            <button
              className="btn btn-primary text-xs gap-1.5 flex-1"
              onClick={() => setShowAdj(!showAdj)}
            >
              <Plus size={13} strokeWidth={2.5} />
              {showAdj ? 'Cancel Adjustment' : 'Adjust Stock'}
            </button>
            <button
              className="btn btn-ghost text-xs gap-1.5"
              onClick={onEdit}
            >
              <Edit3 size={13} />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Manual adjustment form */}
      {showAdj && canAdjust && (
        <form
          onSubmit={handleAdjust}
          className="card p-5 mb-5 space-y-4"
          style={{ border: '1.5px solid var(--violet)' }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-dark)' }}>
            Record Stock Adjustment
          </div>

          {adjError && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {adjError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Direction</label>
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
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Quantity</label>
              <input
                className="field-input font-mono text-sm"
                type="number"
                min="1"
                required
                value={adjForm.quantity}
                onChange={e => setAdjForm(p => ({ ...p, quantity: e.target.value }))}
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-soft)' }}>Reason / Notes *</label>
            <input
              className="field-input"
              required
              value={adjForm.reason}
              onChange={e => setAdjForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Supplier delivery, damage count..."
            />
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary w-full text-sm">
            {isPending ? 'Saving…' : 'Submit Adjustment'}
          </button>
        </form>
      )}

      {/* Movement history */}
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-soft)' }}>
        Stock History Log
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="p-8 text-center text-sm italic" style={{ color: 'var(--ink-muted)' }}>
          No stock movements recorded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((mv) => (
            <div
              key={mv.id}
              className="flex gap-3 items-center p-3 rounded-xl transition-colors"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--edge)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={mv.type === 'IN'
                  ? { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }
                  : { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }
                }
              >
                {mv.type === 'IN' ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: mv.type === 'IN' ? '#059669' : '#EF4444' }}
                  >
                    {mv.type === 'IN' ? '+' : '-'}{mv.quantity} units
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {new Date(mv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--ink-dark)' }}>{mv.reason}</div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--ink-soft)' }}>by {mv.created_by_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />
    </Drawer>
  );
}
