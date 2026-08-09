import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from './useCustomers';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusStamp from '../../components/ui/StatusStamp';
import CustomerFormDrawer from './CustomerFormDrawer';
import { UserPlus, SlidersHorizontal, X } from 'lucide-react';
import { TYPE_COLORS } from '../../theme/tokens';

const COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    render: (v, row) => (
      <div>
        <div className="font-medium text-sm" style={{ color: 'var(--ink-dark)' }}>{v}</div>
        {row.business_name && <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{row.business_name}</div>}
      </div>
    ),
  },
  {
    key: 'mobile',
    header: 'Mobile',
    mono: true,
    render: (v) => <span className="font-mono text-sm" style={{ color: 'var(--ink-mid)' }}>{v}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (v) => {
      const t = TYPE_COLORS[v] || { color: '#6B7280', bg: '#F3F4F6' };
      return (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ color: t.color, background: t.bg }}>
          {v}
        </span>
      );
    },
  },
  { key: 'status', header: 'Status', render: (v) => <StatusStamp status={v} /> },
  {
    key: 'gst_number',
    header: 'GST No.',
    render: (v) => v
      ? <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>{v}</span>
      : <span style={{ color: 'var(--ink-muted)' }}>—</span>,
  },
  {
    key: 'follow_up_date',
    header: 'Follow-up',
    render: (v) => v ? (
      <span className="font-mono text-xs font-semibold" style={{ color: new Date(v) < new Date() ? '#DC2626' : '#D97706' }}>
        {new Date(v).toLocaleDateString('en-IN')}
      </span>
    ) : <span style={{ color: 'var(--ink-muted)' }}>—</span>,
  },
];

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined, status: status || undefined,
    type: type || undefined, page, limit: 20,
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';
  const handleRowClick = useCallback((row) => navigate(`/customers/${row.id}`), [navigate]);
  const hasFilters = search || status || type;

  return (
    <AppShell>
      <TopBar
        title="Customers"
        actions={canEdit && (
          <button className="btn btn-primary" onClick={() => { setEditCustomer(null); setDrawerOpen(true); }}>
            <UserPlus size={14} strokeWidth={2.5} />
            Add Customer
          </button>
        )}
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Filter bar */}
        <div className="card flex flex-wrap items-center gap-3 p-3 mb-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, mobile, business…" />

          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatus(''); setType(''); setPage(1); }}
              className="btn btn-ghost text-xs gap-1.5"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <DataTable
            columns={COLUMNS}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No customers yet — add one to start tracking."
            onRowClick={handleRowClick}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>

      <CustomerFormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} customer={editCustomer} />
    </AppShell>
  );
}
