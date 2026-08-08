import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateChallan } from './useChallans';
import { useCustomers } from '../customers/useCustomers';
import { useProducts } from '../products/useProducts';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import SearchInput from '../../components/ui/SearchInput';
import { Plus, Trash2, Package, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ChallanBuilderPage — create a new DRAFT challan
// Product search + line items + running total
// ─────────────────────────────────────────────────────────────────────────────

export default function ChallanBuilderPage() {
  const navigate = useNavigate();
  const { mutate: createChallan, isPending, error } = useCreateChallan();

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [lineItems, setLineItems] = useState([]);
  // { product, quantity }

  const { data: customersData } = useCustomers({
    search: customerSearch || undefined,
    status: 'ACTIVE',
    limit: 20,
  });

  const { data: productsData } = useProducts({
    search: productSearch || undefined,
    limit: 20,
  });

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const selectedCustomer = customers.find((c) => c.id === customerId) ||
    (customerId ? { id: customerId, name: 'Selected Customer' } : null);

  function addProduct(product) {
    setLineItems((prev) => {
      // If already in list, increment quantity
      const existing = prev.findIndex((li) => li.product.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    setProductSearch('');
  }

  function updateQty(productId, qty) {
    setLineItems((prev) =>
      prev.map((li) => li.product.id === productId ? { ...li, quantity: Math.max(1, parseInt(qty) || 1) } : li)
    );
  }

  function removeItem(productId) {
    setLineItems((prev) => prev.filter((li) => li.product.id !== productId));
  }

  const grandTotal = lineItems.reduce(
    (sum, li) => sum + parseFloat(li.product.unit_price) * li.quantity,
    0
  );
  const totalQty = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  function handleCreate(e) {
    e.preventDefault();
    if (!customerId || lineItems.length === 0) return;

    createChallan(
      {
        customerId,
        items: lineItems.map((li) => ({ productId: li.product.id, quantity: li.quantity })),
      },
      {
        onSuccess: (data) => navigate(`/challans/${data.data.id}`),
      }
    );
  }

  const errorMsg = error?.message;

  return (
    <AppShell>
      <TopBar title="New Challan" />

      <div className="flex-1 overflow-auto p-6">
        <button
          onClick={() => navigate('/challans')}
          className="flex items-center gap-1.5 text-sm text-slate-text/60 hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> All Challans
        </button>

        {errorMsg && (
          <div
            className="mb-5 px-4 py-3 rounded text-sm"
            style={{ backgroundColor: 'rgba(196,80,31,0.1)', border: '1px solid rgba(196,80,31,0.3)', color: '#C4501F' }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left — customer + product search */}
            <div className="lg:col-span-2 space-y-5">

              {/* Customer selector */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                  Customer *
                </div>

                <SearchInput
                  value={customerSearch}
                  onChange={setCustomerSearch}
                  placeholder="Search active customers…"
                />

                {customerSearch && (
                  <div
                    className="mt-2 rounded border overflow-hidden"
                    style={{ borderColor: '#2B3240', backgroundColor: '#12151B' }}
                  >
                    {customers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-text/50 italic">No active customers found.</div>
                    ) : (
                      customers.slice(0, 8).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setCustomerId(c.id); setCustomerSearch(''); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-steel/40 transition-colors border-b border-steel/30 last:border-0"
                        >
                          <div className="font-medium text-sm text-white">{c.name}</div>
                          <div className="font-mono text-xs text-slate-text/50">{c.mobile} · {c.type}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selectedCustomer && !customerSearch && (
                  <div
                    className="mt-3 flex items-center justify-between px-3 py-2 rounded"
                    style={{ backgroundColor: 'rgba(63,153,103,0.08)', border: '1px solid rgba(63,153,103,0.2)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: '#3F9967' }}>
                      ✓ {selectedCustomer.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomerId('')}
                      className="text-xs text-slate-text/50 hover:text-slate-text transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Product search + add */}
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                  Add Products
                </div>

                <SearchInput
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder="Search by name or SKU…"
                />

                {productSearch && (
                  <div
                    className="mt-2 rounded border overflow-hidden"
                    style={{ borderColor: '#2B3240', backgroundColor: '#12151B' }}
                  >
                    {products.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-text/50 italic">No products found.</div>
                    ) : (
                      products.slice(0, 10).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-steel/40 transition-colors border-b border-steel/30 last:border-0 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs" style={{ color: '#F2A93B' }}>{p.sku}</span>
                              <span className="text-sm text-white">{p.name}</span>
                            </div>
                            <div className="font-mono text-xs text-slate-text/50 mt-0.5">
                              ₹{parseFloat(p.unit_price).toFixed(2)} · Stock: {p.stock}
                            </div>
                          </div>
                          <Plus size={14} className="text-ledger-green flex-shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Line items table */}
              {lineItems.length > 0 && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
                >
                  <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: '#2B3240' }}>
                    <Package size={14} className="text-signal-amber" />
                    <span className="text-sm font-semibold text-white">
                      Line Items ({lineItems.length})
                    </span>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-steel">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">SKU / Product</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Unit Price</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50" style={{ width: '110px' }}>Qty</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Total</th>
                        <th className="px-4 py-2.5" style={{ width: '40px' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li) => (
                        <tr key={li.product.id} className="border-b border-steel/40">
                          <td className="px-4 py-3">
                            <div className="font-mono text-xs" style={{ color: '#F2A93B' }}>{li.product.sku}</div>
                            <div className="text-sm text-white">{li.product.name}</div>
                            {li.quantity > li.product.stock && (
                              <div className="text-xs font-mono mt-0.5" style={{ color: '#C4501F' }}>
                                ⚠ Only {li.product.stock} available
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">
                            ₹{parseFloat(li.product.unit_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min="1"
                              value={li.quantity}
                              onChange={(e) => updateQty(li.product.id, e.target.value)}
                              className="field-input font-mono text-sm text-right"
                              style={{ width: '80px', padding: '4px 8px' }}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-white">
                            ₹{(parseFloat(li.product.unit_price) * li.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(li.product.id)}
                              className="p-1 rounded transition-colors hover:bg-rust-alert/10"
                              style={{ color: '#C4501F' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right — summary + action */}
            <div className="space-y-4">
              <div
                className="rounded-lg p-5 sticky top-0"
                style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B7280' }}>
                  Challan Summary
                </div>

                <div className="space-y-3 mb-5">
                  <SummaryRow label="Customer" value={selectedCustomer?.name || '—'} />
                  <SummaryRow label="Line Items" value={`${lineItems.length} product${lineItems.length !== 1 ? 's' : ''}`} mono />
                  <SummaryRow label="Total Quantity" value={totalQty} mono />
                  <div className="border-t border-steel pt-3">
                    <SummaryRow
                      label="Grand Total"
                      value={`₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                      large
                      mono
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className="text-xs px-3 py-2 rounded font-mono"
                    style={{ backgroundColor: 'rgba(242,169,59,0.06)', border: '1px solid rgba(242,169,59,0.15)', color: '#F2A93B' }}
                  >
                    Saved as DRAFT — stock is not deducted until you confirm.
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || !customerId || lineItems.length === 0}
                    className="btn-primary w-full"
                  >
                    {isPending ? 'Creating…' : 'Create Draft Challan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/challans')}
                    className="btn-ghost w-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function SummaryRow({ label, value, mono, large }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-text/50">{label}</span>
      <span className={`${mono ? 'font-mono' : ''} ${large ? 'text-base font-bold text-white' : 'text-sm text-slate-text'}`}>
        {value}
      </span>
    </div>
  );
}
