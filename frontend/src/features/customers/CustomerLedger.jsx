import { useCustomerLedger } from './useCustomers';
import { ArrowUpRight, ArrowDownRight, CreditCard, FileText } from 'lucide-react';

export default function CustomerLedger({ customerId }) {
  const { data, isLoading, isError } = useCustomerLedger(customerId);

  if (isLoading) {
    return <div className="text-sm font-mono text-slate-text/50 animate-pulse p-4">Loading ledger…</div>;
  }

  if (isError) {
    return <div className="text-sm font-mono text-rust-alert p-4">Failed to load ledger.</div>;
  }

  const ledger = data?.data || [];

  if (ledger.length === 0) {
    return (
      <div className="p-8 text-center border-t border-steel/50">
        <div className="text-sm italic text-slate-text/50">No financial history available.</div>
      </div>
    );
  }

  return (
    <div className="border-t border-steel/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-steel bg-steel/5">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-text/50">Details</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Debit (Invoice)</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Credit (Payment)</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-slate-text/50">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel/40">
          {ledger.map((entry) => {
            const isChallan = entry.type === 'CHALLAN';
            const amount = parseFloat(entry.amount);
            
            return (
              <tr key={`${entry.type}-${entry.id}`} className="hover:bg-steel/10 transition-colors">
                <td className="px-5 py-3 text-sm font-mono text-slate-text/80">
                  {new Date(entry.date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {isChallan ? (
                      <FileText size={14} className="text-slate-text/50" />
                    ) : (
                      <CreditCard size={14} className="text-ledger-green/70" />
                    )}
                    <span className="text-sm font-medium text-white">
                      {isChallan ? 'Invoice' : 'Payment'}
                    </span>
                    <span className="text-xs font-mono text-slate-text/50 ml-1">
                      {entry.reference?.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm">
                  {isChallan ? (
                    <span className="text-white">
                      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-sm">
                  {!isChallan ? (
                    <span className="text-ledger-green">
                      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-white">
                  ₹{parseFloat(entry.running_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
