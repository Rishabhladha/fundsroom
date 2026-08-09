import { useState, useCallback } from 'react';
import { useProducts } from './useProducts';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import ProductFormDrawer from './ProductFormDrawer';
import StockMovementLog from './StockMovementLog';
import { PackagePlus, AlertTriangle, X } from 'lucide-react';

const COLUMNS = [
  {
    key: 'sku',
    header: 'SKU',
    render: (v) => (
      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>
        {v}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Product',
    render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm" style={{ color: 'var(--ink-dark)' }}>{v}</span>
        {row.low_stock && (
          <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
            <AlertTriangle size={9} strokeWidth={2.5} /> LOW
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    render: (v) => (
      <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'var(--canvas)', color: 'var(--ink-soft)', border: '1px solid var(--edge)' }}>
        {v}
      </span>
    ),
  },
  {
    key: 'unit_price',
    header: 'Unit Price',
    align: 'right',
    render: (v) => <span className="font-mono text-sm font-medium" style={{ color: 'var(--ink-dark)' }}>₹{parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
  },
  {
    key: 'stock',
    header: 'Stock',
    align: 'right',
    render: (v, row) => (
      <span className="font-mono font-bold text-sm" style={{ color: row.low_stock ? '#D97706' : v === 0 ? '#EF4444' : '#10B981' }}>
        {v}
      </span>
    ),
  },
  {
    key: 'min_stock',
    header: 'Min',
    align: 'right',
    render: (v) => <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>{v}</span>,
  },
  {
    key: 'location',
    header: 'Location',
    render: (v) => v ? <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>{v}</span> : <span style={{ color: 'var(--ink-muted)' }}>—</span>,
  },
];

export default function ProductsListPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [movLogProduct, setMovLogProduct] = useState(null);

  const { data, isLoading } = useProducts({
    search: search || undefined, category: category || undefined,
    lowStock: lowStock ? 'true' : undefined, page, limit: 20,
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const columnsWithActions = [
    ...COLUMNS,
    ...(canEdit ? [{
      key: 'actions',
      header: '',
      align: 'right',
      render: (_, row) => (
        <button
          className="btn btn-ghost text-xs px-3 py-1.5"
          onClick={(e) => { e.stopPropagation(); setEditProduct(row); setDrawerOpen(true); }}
        >
          Edit
        </button>
      ),
    }] : []),
  ];

  const handleRowClick = useCallback((row) => setMovLogProduct(row), []);

  return (
    <AppShell>
      <TopBar
        title="Products & Inventory"
        actions={canEdit && (
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setDrawerOpen(true); }}>
            <PackagePlus size={14} strokeWidth={2.5} />
            Add Product
          </button>
        )}
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Filter bar */}
        <div className="card flex flex-wrap items-center gap-3 p-3 mb-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or SKU…" />

          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">All Categories</option>
            <option value="GRAINS">Grains</option>
            <option value="OILS">Oils</option>
            <option value="SPICES">Spices</option>
            <option value="PULSES">Pulses</option>
            <option value="PACKAGING">Packaging</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={e => { setLowStock(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--amber)' }}
            />
            <span className="text-sm flex items-center gap-1.5" style={{ color: lowStock ? '#D97706' : 'var(--ink-soft)' }}>
              <AlertTriangle size={13} strokeWidth={2.5} />
              Low stock only
            </span>
          </label>

          {(search || category || lowStock) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setLowStock(false); setPage(1); }}
              className="btn btn-ghost text-xs gap-1.5"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          <DataTable
            columns={columnsWithActions}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No products found. Add your first product to start tracking inventory."
            onRowClick={handleRowClick}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>

        <p className="text-xs mt-3 font-mono" style={{ color: 'var(--ink-muted)' }}>
          Click any row to view stock movement history
        </p>
      </div>

      <ProductFormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} product={editProduct} />

      {movLogProduct && (
        <StockMovementLog
          product={movLogProduct}
          canAdjust={canEdit}
          onClose={() => setMovLogProduct(null)}
          onEdit={() => { const p = movLogProduct; setMovLogProduct(null); setEditProduct(p); setDrawerOpen(true); }}
        />
      )}
    </AppShell>
  );
}
