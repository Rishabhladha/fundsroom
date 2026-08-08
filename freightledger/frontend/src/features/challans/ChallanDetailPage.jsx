import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallan, useConfirmChallan, useCancelChallan } from './useChallans';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StampBadge from './StampBadge';
import { ArrowLeft, FileDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ChallanDetailPage — view challan, confirm, cancel, download PDF
// ─────────────────────────────────────────────────────────────────────────────

export default function ChallanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useChallan(id);
  const { mutate: confirm, isPending: confirming, error: confirmError } = useConfirmChallan(id);
  const { mutate: cancel, isPending: cancelling } = useCancelChallan(id);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmingAnimation, setConfirmingAnimation] = useState(false);

  const challan = data?.data;
  const items = challan?.items || [];

  const canAction = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canPdf =
    user?.role === 'ADMIN' ||
    user?.role === 'ACCOUNTS' ||
    (user?.role === 'SALES' && challan?.created_by === user?.id);

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

  function handleConfirm() {
    setActionError(null);
    confirm(undefined, {
      onSuccess: () => setConfirmingAnimation(true),
      onError: (err) => setActionError(err.message || 'Failed to confirm challan'),
    });
  }

  function handleCancel() {
    if (!window.confirm(`Cancel challan ${challan.challan_number}? ${challan.status === 'CONFIRMED' ? 'Stock will be restored.' : ''}`)) return;
    setActionError(null);
    cancel(undefined, {
      onError: (err) => setActionError(err.message || 'Failed to cancel challan'),
    });
  }

  if (isLoading) {
    return (
      <AppShell>
        <TopBar title="Challan" />
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-slate-text/50 animate-pulse">Loading…</div>
        </div>
      </AppShell>
    );
  }

  if (isError || !challan) {
    return (
      <AppShell>
        <TopBar title="Challan" />
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-rust-alert">Challan not found.</div>
        </div>
      </AppShell>
    );
  }

  const grandTotal = parseFloat(challan.grand_total || 0);

  return (
    <AppShell>
      <TopBar
        title={challan.challan_number}
        actions={
          <div className="flex items-center gap-2">
            {/* PDF Download */}
            {canPdf && challan.status !== 'DRAFT' && (
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="btn-ghost flex items-center gap-1.5 text-sm"
              >
                <FileDown size={14} />
                {pdfLoading ? 'Generating…' : 'Invoice PDF'}
              </button>
            )}

            {/* Confirm */}
            {canAction && challan.status === 'DRAFT' && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="btn-success flex items-center gap-1.5 text-sm"
              >
                <CheckCircle size={14} />
                {confirming ? 'Confirming…' : 'Confirm Challan'}
              </button>
            )}

            {/* Cancel */}
            {canAction && challan.status !== 'CANCELLED' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <XCircle size={14} />
                {cancelling ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <button
          onClick={() => navigate('/challans')}
          className="flex items-center gap-1.5 text-sm text-slate-text/60 hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> All Challans
        </button>

        {/* Action error */}
        {actionError && (
          <div
            className="mb-5 px-4 py-3 rounded text-sm flex items-start gap-2"
            style={{ backgroundColor: 'rgba(196,80,31,0.1)', border: '1px solid rgba(196,80,31,0.3)', color: '#C4501F' }}
          >
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — challan meta */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status stamp — large, animates on confirm */}
            <div
              className="rounded-lg p-6 flex flex-col items-center text-center"
              style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
            >
              <StampBadge status={challan.status} large animate={confirmingAnimation} />

              <div className="mt-4 font-display font-bold text-xl text-white">
                {challan.challan_number}
              </div>

              <div className="font-mono text-xs mt-1" style={{ color: '#6B7280' }}>
                {new Date(challan.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>

              {challan.confirmed_at && (
                <div className="font-mono text-xs mt-1" style={{ color: '#3F9967' }}>
                  Confirmed {new Date(challan.confirmed_at).toLocaleDateString('en-IN')}
                </div>
              )}
              {challan.cancelled_at && (
                <div className="font-mono text-xs mt-1" style={{ color: '#C4501F' }}>
                  Cancelled {new Date(challan.cancelled_at).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>

            {/* Customer info */}
            <div
              className="rounded-lg p-5"
              style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Customer
              </div>
              <div className="font-semibold text-white">{challan.customer_name}</div>
              {challan.customer_mobile && (
                <div className="font-mono text-xs mt-1 text-slate-text/60">{challan.customer_mobile}</div>
              )}
              {challan.customer_gst && (
                <div className="font-mono text-xs mt-1 text-slate-text/50">GST: {challan.customer_gst}</div>
              )}
              {challan.customer_address && (
                <div className="text-xs mt-2 text-slate-text/50 leading-relaxed">{challan.customer_address}</div>
              )}
            </div>

            {/* Prepared by */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#6B7280' }}>
                Prepared By
              </div>
              <div className="text-sm text-white">{challan.created_by_name}</div>
            </div>
          </div>

          {/* Right — line items */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: '#2B3240' }}>
                <div className="text-sm font-semibold text-white">
                  Line Items — {items.length} product{items.length !== 1 ? 's' : ''}
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className={`border-b border-steel/40 ${i % 2 === 1 ? 'bg-ink/20' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#F2A93B' }}>{item.sku_snapshot}</td>
                      <td className="px-4 py-3 text-sm text-white">{item.product_name_snapshot}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">₹{parseFloat(item.unit_price_snapshot).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                        ₹{parseFloat(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals row */}
              <div
                className="px-5 py-4 border-t flex items-center justify-between"
                style={{ borderColor: '#2B3240' }}
              >
                <div className="font-mono text-sm text-slate-text/60">
                  Total qty: <span className="font-semibold text-white">{challan.total_quantity}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-text/50 mb-0.5">Grand Total</div>
                  <div className="font-mono font-bold text-xl text-white">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
