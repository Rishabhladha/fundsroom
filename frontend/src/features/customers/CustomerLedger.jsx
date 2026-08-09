import { useCustomerLedger } from './useCustomers';
import { CreditCard, FileText } from 'lucide-react';

export default function CustomerLedger({ customerId }) {
  const { data, isLoading, isError } = useCustomerLedger(customerId);

  if (isLoading) {
    return <div className="text-xs font-mono p-6 animate-pulse" style={{ color: 'var(--ink-muted)' }}>Loading statement of account…</div>;
  }

  if (isError) {
    return <div className="text-xs font-mono p-6" style={{ color: '#DC2626' }}>Failed to load statement of account.</div>;
  }

  const ledger = data?.data || [];

  if (ledger.length === 0) {
    return (
      <div className="p-8 text-center" style={{ borderTop: '1px solid var(--edge)' }}>
        <div className="text-xs italic" style={{ color: 'var(--ink-muted)' }}>No financial transactions or dispatch invoices recorded yet.</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" style={{ borderTop: '1px solid var(--edge)' }}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Date</th>
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Transaction Details</th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Debit (Invoice)</th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Credit (Payment)</th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>Running Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--edge)' }}>
          {ledger.map((entry) => {
            const isChallan = entry.type === 'CHALLAN';
            const amount = parseFloat(entry.amount);
            const runningBal = parseFloat(entry.running_balance);
            
            return (
              <tr
                key={`${entry.type}-${entry.id}`}
                className="transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-5 py-3.5 text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
                  {new Date(entry.date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {isChallan ? (
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--violet-light)' }}>
                        <FileText size={13} style={{ color: 'var(--violet)' }} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
                        <CreditCard size={13} style={{ color: '#059669' }} />
                      </div>
                    )}
                    <span className="text-xs font-semibold" style={{ color: 'var(--ink-dark)' }}>
                      {isChallan ? 'Dispatch Invoice' : 'Payment Received'}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>
                      {entry.reference?.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs font-medium" style={{ color: 'var(--ink-dark)' }}>
                  {isChallan ? (
                    <span>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  ) : (
                    <span style={{ color: 'var(--ink-muted)' }}>—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs font-semibold" style={{ color: '#059669' }}>
                  {!isChallan ? (
                    <span>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  ) : (
                    <span style={{ color: 'var(--ink-muted)' }}>—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs font-bold" style={{ color: runningBal > 0 ? '#DC2626' : runningBal < 0 ? '#059669' : 'var(--ink-dark)' }}>
                  {runningBal < 0
                    ? `₹${Math.abs(runningBal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr`
                    : `₹${runningBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
