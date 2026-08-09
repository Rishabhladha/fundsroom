import { useState } from 'react';
import Drawer from '../../components/ui/Drawer';
import { useCreateProduct, useUpdateProduct } from './useProducts';

const EMPTY = {
  name: '', sku: '', category: 'GRAINS', unit_price: '',
  stock: '0', min_stock: '0', location: '',
};

export default function ProductFormDrawer({ isOpen, onClose, product }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...product } : EMPTY);
  const [error, setError] = useState(null);

  const { mutate: create, isPending: creating } = useCreateProduct();
  const { mutate: update, isPending: updating } = useUpdateProduct(product?.id);
  const isPending = creating || updating;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price),
      stock: parseInt(form.stock) || 0,
      min_stock: parseInt(form.min_stock) || 0,
      location: form.location || undefined,
    };

    const onSuccess = () => { onClose(); setForm(EMPTY); };
    const onError = (err) => setError(err.message || 'Failed to save product');

    if (isEdit) {
      // Don't send stock on edit — stock is managed via movements
      const { stock, ...updatePayload } = payload;
      update(updatePayload, { onSuccess, onError });
    } else {
      create(payload, { onSuccess, onError });
    }
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded text-sm" style={{ backgroundColor: 'rgba(196,80,31,0.1)', border: '1px solid rgba(196,80,31,0.3)', color: '#C4501F' }}>
            {error}
          </div>
        )}

        {isEdit && (
          <div className="px-3 py-2 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(242,169,59,0.06)', border: '1px solid rgba(242,169,59,0.15)', color: '#F2A93B' }}>
            Stock is managed via the movement log, not here.
          </div>
        )}

        <Field label="Product Name *">
          <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Basmati Rice 25kg Sack" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU *">
            <input className="field-input font-mono" value={form.sku} onChange={e => set('sku', e.target.value.toUpperCase())} required placeholder="GR-BR-025" disabled={isEdit} />
          </Field>
          <Field label="Category *">
            <select className="field-input" value={form.category} onChange={e => set('category', e.target.value)} required>
              <option value="GRAINS">Grains</option>
              <option value="OILS">Oils</option>
              <option value="SPICES">Spices</option>
              <option value="PULSES">Pulses</option>
              <option value="PACKAGING">Packaging</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Unit Price (₹) *">
            <input className="field-input font-mono" type="number" min="0" step="0.01" value={form.unit_price} onChange={e => set('unit_price', e.target.value)} required placeholder="1450.00" />
          </Field>
          <Field label="Min Stock (Alert Level)">
            <input className="field-input font-mono" type="number" min="0" value={form.min_stock} onChange={e => set('min_stock', e.target.value)} placeholder="50" />
          </Field>
        </div>

        {!isEdit && (
          <Field label="Opening Stock">
            <input className="field-input font-mono" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
          </Field>
        )}

        <Field label="Warehouse Location">
          <input className="field-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Rack A1" />
        </Field>

        <div className="flex gap-3 pt-3 mt-2" style={{ borderTop: '1px solid var(--edge)' }}>
          <button type="submit" disabled={isPending} className="btn btn-primary flex-1">
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </form>
    </Drawer>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#6B7280' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
