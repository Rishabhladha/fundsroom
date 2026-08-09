import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallan, useConfirmChallan, useCancelChallan } from './useChallans';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StampBadge from './StampBadge';
import { ArrowLeft, FileDown, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';
import RecordPaymentDrawer from '../payments/RecordPaymentDrawer';
import { usePayments } from '../payments/usePayments';

export default function ChallanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useChallan(id);
  const { mutate: confirm, isPending: confirming } = useConfirmChallan(id);
  const { mutate: cancel, isPending: cancelling } = useCancelChallan(id);
  const { data: paymentsData } = usePayments({ challanId: id });

  const [pdfLoading, setPdfLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmingAnimation, setConfirmingAnimation] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);

  const payments = paymentsData?.data || [];
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const challan = data?.data;
  const items = challan?.items || [];

  const canAction = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canPdf = user?.role === 'ADMIN' || user?.role === 'ACCOUNTS' || (user?.role === 'SALES' && challan?.created_by === user?.id);

  async function handleDownloadPdf() {
    setPdfLoading(true);
    try {
      const blob = await api.downloadPdf(`/challans/${id}/invoice.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${challan.challan_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err.message || 'Failed to download PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  if (isLoading) return (
    <AppShell>
      <TopBar title="Challan" />
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="skeleton h-4 w-40" />
      </div>
    </AppShell>
  );

  if (isError || !challan) return (
    <AppShell>
      <TopBar title="Challan" />
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
        <div className="text-sm font-mono" style={{ color: '#EF4444' }}>Challan not found.</div>
      </div>
    </AppShell>
  );

  const balance = parseFloat(challan.total_amount || 0) - totalPaid;

  return (
    <AppShell>
      <TopBar
        title={challan.challan_number}
        actions={
          <div className="flex items-center gap-2">
            {canPdf && challan.status !== 'DRAFT' && (
              <button onClick={handleDownloadPdf} disabled={pdfLoading} className="btn btn-ghost text-sm">
                <FileDown size={13} /> {pdfLoading ? 'Generating…' : 'PDF'}
              </button>
            )}
            {canAction && challan.status === 'DRAFT' && (
              <button onClick={() => { setActionError(null); confirm(undefined, { onSuccess: () => setConfirmingAnimation(true), onError: (e) => setActionError(e.message) }); }} disabled={confirming} className="btn btn-success text-sm">
                <CheckCircle size={13} /> {confirming ? 'Confirming…' : 'Confirm'}
              </button>
            )}
            {canAction && challan.status !== 'CANCELLED' && challan.status !== 'DRAFT' && (
              <button onClick={() => setPaymentDrawerOpen(true)} className="btn btn-primary text-sm">
                <CreditCard size={13} /> Payment
              </button>
            )}
            {canAction && challan.status !== 'CANCELLED' && (
              <button onClick={() => { if (!window.confirm(`Cancel ${challan.challan_number}?`)) return; cancel(undefined, { onError: (e) => setActionError(e.message) }); }} disabled={cancelling} className="btn btn-danger text-sm">
                <XCircle size={13} /> {cancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        }
      />

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

        {actionError && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left meta column */}
          <div className="space-y-4">
            {/* Status card */}
            <div className="card p-6 text-center">
              <StampBadge status={challan.status} large animate={confirmingAnimation} />
              <div className="font-display font-bold text-xl mt-4" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.02em' }}>
                {challan.challan_number}
              </div>
              <div className="font-mono text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                {new Date(challan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {challan.confirmed_at && (
                <div className="font-mono text-xs mt-1 font-semibold" style={{ color: '#059669' }}>
                  ✓ Confirmed {new Date(challan.confirmed_at).toLocaleDateString('en-IN')}
                </div>
              )}
              {challan.cancelled_at && (
                <div className="font-mono text-xs mt-1 font-semibold" style={{ color: '#EF4444' }}>
                  × Cancelled {new Date(challan.cancelled_at).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ink-muted)' }}>Customer</div>
              <div className="font-semibold" style={{ color: 'var(--ink-dark)' }}>{challan.customer_name}</div>
              {challan.customer_mobile && <div className="font-mono text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{challan.customer_mobile}</div>}
              {challan.customer_gst && <div className="font-mono text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>GST: {challan.customer_gst}</div>}
              {challan.customer_address && <div className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{challan.customer_address}</div>}
            </div>

            {/* Prepared by */}
            <div className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--ink-muted)' }}>Prepared By</div>
              <div className="text-sm font-medium" style={{ color: 'var(--ink-dark)' }}>{challan.created_by_name}</div>
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Line items */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
                <div className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>
                  Line Items — {items.length} product{items.length !== 1 ? 's' : ''}
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--edge)' }}>
                    {['SKU', 'Product', 'Unit Price', 'Qty', 'Total'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--ink-soft)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--edge)' : 'none' }}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>
                          {item.sku_snapshot}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--ink-dark)' }}>{item.product_name_snapshot}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: 'var(--ink-mid)' }}>₹{parseFloat(item.unit_price_snapshot).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: 'var(--ink-dark)' }}>{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: 'var(--ink-dark)' }}>₹{parseFloat(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Totals */}
              <div className="px-5 py-4 space-y-2" style={{ borderTop: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
                <TotalRow label="Subtotal" value={`₹${parseFloat(challan.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                {parseFloat(challan.tax_rate) > 0 && (
                  <TotalRow label={`Tax (${challan.tax_rate}%)`} value={`₹${((parseFloat(challan.subtotal || 0) * parseFloat(challan.tax_rate)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                )}
                {parseFloat(challan.discount_amount) > 0 && (
                  <TotalRow label="Discount" value={`-₹${parseFloat(challan.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} accent="#EF4444" />
                )}
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--edge)' }}>
                  <span className="font-semibold" style={{ color: 'var(--ink-dark)' }}>Grand Total</span>
                  <span className="font-mono font-bold text-lg" style={{ color: 'var(--violet)' }}>
                    ₹{parseFloat(challan.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Payments */}
            {challan.status !== 'DRAFT' && (
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} style={{ color: 'var(--emerald)' }} strokeWidth={2.5} />
                    <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>Payments</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span>Paid: <span className="font-bold" style={{ color: '#059669' }}>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
                    <span>Balance: <span className="font-bold" style={{ color: balance > 0 ? '#EF4444' : '#059669' }}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
                  </div>
                </div>
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-sm italic" style={{ color: 'var(--ink-muted)' }}>No payments recorded yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--edge)' }}>
                        {['Date', 'Method', 'Reference', 'Amount'].map((h, i) => (
                          <th key={h} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--ink-soft)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--edge)' : 'none' }}>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--ink-mid)' }}>{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--ink-dark)' }}>{p.method.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--ink-soft)' }}>{p.reference_number || '—'}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: '#059669' }}>₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <RecordPaymentDrawer isOpen={paymentDrawerOpen} onClose={() => setPaymentDrawerOpen(false)} challan={challan} />
    </AppShell>
  );
}

function TotalRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <span className="font-mono" style={{ color: accent || 'var(--ink-mid)' }}>{value}</span>
    </div>
  );
}
