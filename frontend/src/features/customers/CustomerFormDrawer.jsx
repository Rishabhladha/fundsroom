  import { useState, useEffect } from 'react';
import Drawer from '../../components/ui/Drawer';
import { useCreateCustomer, useUpdateCustomer } from './useCustomers';

const EMPTY = {
  name: '', mobile: '', email: '', business_name: '',
  gst_number: '', type: 'RETAIL', address: '', status: 'LEAD',
  follow_up_date: '',
};

export default function CustomerFormDrawer({ isOpen, onClose, customer }) {
  const isEdit = !!customer;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  // Synchronize form values whenever drawer opens or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setForm({
          name: customer.name || '',
          mobile: customer.mobile || '',
          email: customer.email || '',
          business_name: customer.business_name || '',
          gst_number: customer.gst_number || '',
          type: customer.type || 'RETAIL',
          address: customer.address || '',
          status: customer.status || 'LEAD',
          follow_up_date: customer.follow_up_date ? customer.follow_up_date.split('T')[0] : '',
        });
      } else {
        setForm(EMPTY);
      }
      setError(null);
    }
  }, [isOpen, customer]);

  const { mutate: create, isPending: creating } = useCreateCustomer();
  const { mutate: update, isPending: updating } = useUpdateCustomer(customer?.id);

  const isPending = creating || updating;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      email: form.email || undefined,
      business_name: form.business_name || undefined,
      gst_number: form.gst_number || undefined,
      address: form.address || undefined,
      follow_up_date: form.follow_up_date || undefined,
    };

    const onSuccess = () => {
      onClose();
      setForm(EMPTY);
    };
    const onError = (err) => setError(err.message || 'Failed to save customer');

    if (isEdit) {
      update(payload, { onSuccess, onError });
    } else {
      create(payload, { onSuccess, onError });
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Customer' : 'Add Customer'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded text-sm"
            style={{ backgroundColor: 'rgba(196,80,31,0.1)', border: '1px solid rgba(196,80,31,0.3)', color: '#C4501F' }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name *" required>
            <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Rajesh Agarwal" />
          </Field>
          <Field label="Mobile *" required>
            <input className="field-input font-mono" value={form.mobile} onChange={e => set('mobile', e.target.value)} required placeholder="9876543210" />
          </Field>
        </div>

        <Field label="Email">
          <input className="field-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rajesh@company.com" />
        </Field>

        <Field label="Business / Company Name">
          <input className="field-input" value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Agarwal Traders" />
        </Field>

        <Field label="GST Number">
          <input className="field-input font-mono" value={form.gst_number} onChange={e => set('gst_number', e.target.value.toUpperCase())} placeholder="27AAACR5055K1Z5" maxLength={15} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type *">
            <select className="field-input" value={form.type} onChange={e => set('type', e.target.value)} required>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </div>

        <Field label="Address">
          <textarea className="field-input" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="12, Market Yard, Pune 411037" style={{ resize: 'vertical' }} />
        </Field>

        <Field label="Follow-up Date">
          <input className="field-input" type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending} className="btn-primary flex-1">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </Drawer>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#6B7280' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
