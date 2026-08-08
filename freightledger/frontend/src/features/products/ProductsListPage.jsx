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
import { PackagePlus, AlertTriangle, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ProductsListPage
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: 'sku',
    header: 'SKU',
    mono: true,
    render: (v) => <span className="font-mono text-xs text-signal-amber">{v}</span>,
  },
  {
    key: 'name',
    header: 'Product Name',
    render: (v, row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">{v}</span>
        {row.low_stock && (
          <span
            className="flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(242,169,59,0.1)', color: '#F2A93B', border: '1px solid rgba(242,169,59,0.2)' }}
          >
            <AlertTriangle size={10} />
            LOW
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    render: (v) => (
      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#2B3240', color: '#C7CCD6' }}>
        {v}
      </span>
    ),
  },
  {
    key: 'unit_price',
    header: 'Unit Price',
    align: 'right',
    mono: true,
    render: (v) => <span className="font-mono text-sm">₹{parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
  },
  {
    key: 'stock',
    header: 'Stock',
    align: 'right',
    render: (v, row) => (
      <span
        className="font-mono font-semibold text-sm"
        style={{ color: row.low_stock ? '#F2A93B' : v === 0 ? '#C4501F' : '#3F9967' }}
      >
        {v}
      </span>
    ),
  },
  {
    key: 'min_stock',
    header: 'Min',
    align: 'right',
    mono: true,
    render: (v) => <span className="font-mono text-xs text-slate-text/50">{v}</span>,
  },
  {
    key: 'location',
    header: 'Location',
    render: (v) => v ? (
      <span className="font-mono text-xs text-slate-text/60">{v}</span>
    ) : <span className="text-slate-text/30 text-xs">—</span>,
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
    search: search || undefined,
    category: category || undefined,
    lowStock: lowStock ? 'true' : undefined,
    page,
    limit: 20,
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const columnsWithActions = [
    ...COLUMNS,
    ...(canEdit
      ? [
        {
          key: 'actions',
          header: 'Action',
          align: 'right',
          render: (_, row) => (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // prevent opening stock log drawer
                setEditProduct(row);
                setDrawerOpen(true);
              }}
              className="btn-ghost text-xs px-2.5 py-1"
            >
              Edit
            </button>
          ),
        },
      ]
      : []),
  ];

  const handleRowClick = useCallback((row) => {
    setMovLogProduct(row);
  }, []);

  function openCreate() {
    setEditProduct(null);
    setDrawerOpen(true);
  }

  return (
    <AppShell>
      <TopBar
        title="Products & Inventory"
        actions={
          canEdit && (
            <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
              <PackagePlus size={15} />
              Add Product
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name or SKU…"
          />

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto' }}
            id="filter-category"
          >
            <option value="">All Categories</option>
            <option value="GRAINS">Grains</option>
            <option value="OILS">Oils</option>
            <option value="SPICES">Spices</option>
            <option value="PULSES">Pulses</option>
            <option value="PACKAGING">Packaging</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => { setLowStock(e.target.checked); setPage(1); }}
              className="accent-signal-amber"
              id="filter-low-stock"
            />
            <span className="text-sm flex items-center gap-1.5">
              <AlertTriangle size={13} style={{ color: '#F2A93B' }} />
              Low stock only
            </span>
          </label>
        </div>

        {/* Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
        >
          <DataTable
            columns={columnsWithActions}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No products found — add the first product to start tracking inventory."
            onRowClick={handleRowClick}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>

        <p className="text-xs text-slate-text/40 mt-3 font-mono">
          Click any row to view stock movement log or click "Edit" to modify product parameters.
        </p>
      </div>

      {/* Product create/edit drawer */}
      <ProductFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editProduct}
      />

      {/* Stock movement log panel */}
      {movLogProduct && (
        <StockMovementLog
          product={movLogProduct}
          canAdjust={canEdit}
          onClose={() => setMovLogProduct(null)}
          onEdit={() => {
            const p = movLogProduct;
            setMovLogProduct(null); // close stock log first so drawers don't stack awkwardly
            setEditProduct(p);
            setDrawerOpen(true);
          }}
        />
      )}
    </AppShell>
  );
}
