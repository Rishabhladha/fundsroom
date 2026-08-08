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
import { UserPlus, Filter } from 'lucide-react';
import { TYPE_COLORS } from '../../theme/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// CustomersListPage
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: 'name',
    header: 'Name',
    render: (v, row) => (
      <div>
        <div className="font-medium text-white">{v}</div>
        {row.business_name && (
          <div className="text-xs text-slate-text/60 mt-0.5">{row.business_name}</div>
        )}
      </div>
    ),
  },
  {
    key: 'mobile',
    header: 'Mobile',
    mono: true,
    render: (v) => <span className="font-mono text-sm">{v}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (v) => (
      <span
        className="font-mono text-xs px-2 py-0.5 rounded"
        style={{ color: TYPE_COLORS[v] || '#C7CCD6', backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {v}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <StatusStamp status={v} />,
  },
  {
    key: 'gst_number',
    header: 'GST',
    mono: true,
    render: (v) => v ? (
      <span className="font-mono text-xs text-slate-text/70">{v}</span>
    ) : (
      <span className="text-slate-text/30 text-xs">—</span>
    ),
  },
  {
    key: 'follow_up_date',
    header: 'Follow-up',
    render: (v) => v ? (
      <span
        className="font-mono text-xs"
        style={{ color: new Date(v) < new Date() ? '#C4501F' : '#F2A93B' }}
      >
        {new Date(v).toLocaleDateString('en-IN')}
      </span>
    ) : <span className="text-slate-text/30 text-xs">—</span>,
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
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    page,
    limit: 20,
  });

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const handleRowClick = useCallback(
    (row) => navigate(`/customers/${row.id}`),
    [navigate]
  );

  function openCreate() {
    setEditCustomer(null);
    setDrawerOpen(true);
  }

  return (
    <AppShell>
      <TopBar
        title="Customers"
        actions={
          canEdit && (
            <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
              <UserPlus size={15} />
              Add Customer
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name, mobile, business…"
          />

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto' }}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto' }}
            id="filter-type"
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          {(search || status || type) && (
            <button
              onClick={() => { setSearch(''); setStatus(''); setType(''); setPage(1); }}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              <Filter size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
        >
          <DataTable
            columns={COLUMNS}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No customers yet — add the first one to start tracking follow-ups."
            onRowClick={handleRowClick}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>

      <CustomerFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={editCustomer}
      />
    </AppShell>
  );
}
