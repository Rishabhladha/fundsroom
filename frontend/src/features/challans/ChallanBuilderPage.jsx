import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateChallan } from './useChallans';
import { useCustomers } from '../customers/useCustomers';
import { useProducts } from '../products/useProducts';
import CustomerFormDrawer from '../customers/CustomerFormDrawer';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import SearchInput from '../../components/ui/SearchInput';
import { Plus, Trash2, Package, ArrowLeft, User, UserPlus } from 'lucide-react';

export default function ChallanBuilderPage() {
  const navigate = useNavigate();
  const { mutate: createChallan, isPending, error } = useCreateChallan();

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [taxRate, setTaxRate] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState(null);

  const { data: customersData } = useCustomers({ search: customerSearch || undefined, status: 'ACTIVE', limit: 20 });
  const { data: productsData } = useProducts({ search: productSearch || undefined, limit: 20 });

  const customers = customersData?.data || [];
  const products = productsData?.data || [];

  const selectedCustomer = (createdCustomer && createdCustomer.id === customerId)
    ? createdCustomer
    : (customers.find((c) => c.id === customerId) || (customerId ? { id: customerId, name: 'Selected Customer' } : null));

  function addProduct(product) {
    setLineItems((prev) => {
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

  const subtotal = lineItems.reduce((sum, li) => sum + parseFloat(li.product.unit_price) * li.quantity, 0);
  const parsedTax = parseFloat(taxRate);
  const taxAmount = (subtotal * (isNaN(parsedTax) ? 0 : parsedTax)) / 100;
  const parsedDiscount = parseFloat(discountAmount);
  const validDiscount = isNaN(parsedDiscount) ? 0 : parsedDiscount;
  const grandTotal = subtotal + taxAmount - validDiscount;
  const totalQty = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  function handleCreate(e) {
    e.preventDefault();
    if (!customerId || lineItems.length === 0) return;
    createChallan(
      {
        customerId,
        items: lineItems.map((li) => ({ productId: li.product.id, quantity: li.quantity })),
        tax_rate: isNaN(parsedTax) ? 0 : parsedTax,
        discount_amount: validDiscount,
      },
      { onSuccess: (data) => navigate(`/challans/${data.data.id}`) }
    );
  }

  return (
    <AppShell>
      <TopBar title="New Challan" />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        <button
          onClick={() => navigate('/challans')}
          className="flex items-center gap-1.5 text-sm mb-5 transition-colors"
          style={{ color: 'var(--ink-soft)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-soft)'}
        >
          <ArrowLeft size={14} /> All Challans
        </button>

        {error?.message && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
            {error.message}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-4">

              {/* Customer selector */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--violet-light)' }}>
                      <User size={12} style={{ color: 'var(--violet)' }} strokeWidth={2.5} />
                    </div>
                    <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>Customer *</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="btn btn-ghost text-xs gap-1.5 font-semibold py-1.5 px-3 flex items-center transition-all"
                    style={{ color: '#2563EB', border: '1px solid #BFDBFE', background: '#EFF6FF' }}
                  >
                    <UserPlus size={13} /> Add New Customer
                  </button>
                </div>

                <SearchInput value={customerSearch} onChange={setCustomerSearch} placeholder="Search active customers…" />

                {customerSearch && customers.length > 0 && (
                  <div className="mt-2 rounded-xl overflow-hidden shadow-dropdown" style={{ border: '1px solid var(--edge)' }}>
                    {customers.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCustomerId(c.id); setCustomerSearch(''); setCreatedCustomer(c); }}
                        className="w-full text-left px-4 py-3 transition-colors flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--edge)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--ink-dark)' }}>{c.name}</div>
                          <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{c.mobile} · {c.type}</div>
                        </div>
                        {c.business_name && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>
                            {c.business_name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {customerSearch && customers.length === 0 && (
                  <div className="mt-3 p-4 text-center rounded-xl" style={{ border: '1px border-dashed var(--edge)', background: 'var(--surface-2)' }}>
                    <p className="text-xs mb-2.5" style={{ color: 'var(--ink-soft)' }}>
                      No active customer matching &ldquo;{customerSearch}&rdquo; found.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerOpen(true)}
                      className="btn btn-primary py-1.5 px-3 text-xs gap-1.5 inline-flex items-center"
                    >
                      <Plus size={13} /> Create &ldquo;{customerSearch}&rdquo; as New Customer
                    </button>
                  </div>
                )}

                {selectedCustomer && !customerSearch && (
                  <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#059669' }}>✓ {selectedCustomer.name}</span>
                      {selectedCustomer.mobile && (
                        <span className="text-xs font-mono text-emerald-700">({selectedCustomer.mobile})</span>
                      )}
                    </div>
                    <button type="button" onClick={() => { setCustomerId(''); setCreatedCustomer(null); }} className="text-xs font-medium transition-colors" style={{ color: '#059669' }}>Change</button>
                  </div>
                )}
              </div>

              {/* Product search */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                    <Package size={12} style={{ color: '#3B82F6' }} strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>Add Products</span>
                </div>

                <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Search by name or SKU…" />

                {productSearch && (
                  <div className="mt-2 rounded-xl overflow-hidden shadow-dropdown" style={{ border: '1px solid var(--edge)' }}>
                    {products.length === 0
                      ? <div className="px-4 py-4 text-sm italic" style={{ color: 'var(--ink-muted)' }}>No products found.</div>
                      : products.slice(0, 10).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                          style={{ borderBottom: '1px solid var(--edge)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>{p.sku}</span>
                              <span className="font-medium text-sm" style={{ color: 'var(--ink-dark)' }}>{p.name}</span>
                            </div>
                            <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                              ₹{parseFloat(p.unit_price).toFixed(2)} · Stock: {p.stock}
                            </div>
                          </div>
                          <Plus size={14} style={{ color: 'var(--violet)', flexShrink: 0 }} />
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Line items table */}
              {lineItems.length > 0 && (
                <div className="card overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
                    <Package size={14} style={{ color: 'var(--violet)' }} />
                    <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>
                      Line Items ({lineItems.length})
                    </span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--edge)' }}>
                        {['SKU / Product', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
                          <th key={i} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${i >= 1 && i <= 3 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--ink-soft)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li) => (
                        <tr key={li.product.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>{li.product.sku}</span>
                              <span className="text-sm font-medium" style={{ color: 'var(--ink-dark)' }}>{li.product.name}</span>
                            </div>
                            {li.quantity > li.product.stock && (
                              <div className="text-xs font-semibold mt-0.5" style={{ color: '#EF4444' }}>⚠ Only {li.product.stock} available</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: 'var(--ink-mid)' }}>₹{parseFloat(li.product.unit_price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number" min="1"
                              value={li.quantity}
                              onChange={e => updateQty(li.product.id, e.target.value)}
                              className="field-input font-mono text-sm text-right"
                              style={{ width: '70px', padding: '4px 8px' }}
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-sm" style={{ color: 'var(--ink-dark)' }}>
                            ₹{(parseFloat(li.product.unit_price) * li.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(li.product.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-muted)'; }}
                              style={{ color: 'var(--ink-muted)' }}
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

            {/* Summary sidebar */}
            <div>
              <div className="card p-5 sticky top-0">
                <div className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--ink-dark)' }}>Summary</div>

                <div className="space-y-3 mb-5">
                  <SummaryRow label="Customer" value={selectedCustomer?.name || '—'} />
                  <SummaryRow label="Products" value={`${lineItems.length}`} mono />
                  <SummaryRow label="Total Qty" value={`${totalQty}`} mono />

                  <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '12px' }}>
                    <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} mono />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Tax %</span>
                    <input type="number" min="0" step="0.01" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="field-input font-mono text-sm text-right" style={{ width: '90px', padding: '5px 8px' }} placeholder="0" />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>Discount ₹</span>
                    <input type="number" min="0" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="field-input font-mono text-sm text-right" style={{ width: '90px', padding: '5px 8px' }} placeholder="0" />
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '2px solid var(--edge)' }}>
                    <span className="font-display font-bold text-sm" style={{ color: 'var(--ink-dark)' }}>Grand Total</span>
                    <span className="font-mono font-bold text-xl" style={{ color: 'var(--violet)' }}>
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl px-3 py-2.5 text-xs mb-4" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
                  Saved as DRAFT — stock deducted only on confirmation.
                </div>

                <button
                  type="submit"
                  disabled={isPending || !customerId || lineItems.length === 0}
                  className="btn btn-primary w-full mb-2"
                >
                  {isPending ? 'Creating…' : 'Create Draft Challan'}
                </button>
                <button type="button" onClick={() => navigate('/challans')} className="btn btn-ghost w-full">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Add New Customer Inline Drawer */}
      <CustomerFormDrawer
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        initialValues={customerSearch ? { name: customerSearch } : null}
        onCustomerCreated={(newCust) => {
          setCustomerId(newCust.id);
          setCreatedCustomer(newCust);
          setCustomerSearch('');
        }}
      />
    </AppShell>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--ink-dark)' }}>{value}</span>
    </div>
  );
}
