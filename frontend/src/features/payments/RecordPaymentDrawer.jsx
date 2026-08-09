import { useState } from 'react';
import Drawer from '../../components/ui/Drawer';
import { useRecordPayment } from './usePayments';

export default function RecordPaymentDrawer({ isOpen, onClose, challan }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: recordPayment, isPending, error } = useRecordPayment();

  function handleSubmit(e) {
    e.preventDefault();
    recordPayment(
      {
        challanId: challan.id,
        amount,
        method,
        paymentDate,
        referenceNumber,
        notes,
      },
      {
        onSuccess: () => {
          onClose();
          // Reset form
          setAmount('');
          setMethod('BANK_TRANSFER');
          setReferenceNumber('');
          setNotes('');
        },
      }
    );
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Record Payment — ${challan?.challan_number}`}>
      {error && (
        <div className="mb-4 p-3 rounded bg-rust-alert/10 border border-rust-alert/20 text-rust-alert text-sm">
          {error.message || 'Failed to record payment'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-text uppercase tracking-wider mb-1">
            Amount (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field-input w-full"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-text uppercase tracking-wider mb-1">
            Payment Date *
          </label>
          <input
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="field-input w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-text uppercase tracking-wider mb-1">
            Method *
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="field-input w-full"
          >
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-text uppercase tracking-wider mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="field-input w-full"
            placeholder="Txn ID, Cheque No..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-text uppercase tracking-wider mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="field-input w-full min-h-[80px]"
            placeholder="Optional notes..."
          />
        </div>

        <div className="pt-4 flex gap-3" style={{ borderTop: '1px solid var(--edge)' }}>
          <button type="submit" disabled={isPending} className="btn btn-success flex-1">
            {isPending ? 'Saving...' : 'Record Payment'}
          </button>
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-ghost flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}
