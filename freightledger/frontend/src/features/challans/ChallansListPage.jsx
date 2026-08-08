import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallans } from './useChallans';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import StatusStamp from '../../components/ui/StatusStamp';
import { FilePlus, Filter } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ChallansListPage
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: 'challan_number',
    header: 'Challan No.',
    mono: true,
    render: (v) => <span className="font-mono text-sm font-semibold text-white">{v}</span>,
  },
  {
    key: 'customer_name',
    header: 'Customer',
    render: (v) => <span className="text-white font-medium">{v}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (v) => <StatusStamp status={v} />,
  },
  {
    key: 'total_quantity',
    header: 'Total Qty',
    align: 'right',
    mono: true,
    render: (v) => <span className="font-mono">{v}</span>,
  },
  {
    key: 'created_by_name',
    header: 'Created By',
    render: (v) => <span className="text-sm text-slate-text/70">{v}</span>,
  },
  {
    key: 'created_at',
    header: 'Date',
    mono: true,
    render: (v) => (
      <span className="font-mono text-xs text-slate-text/60">
        {new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'confirmed_at',
    header: 'Confirmed',
    mono: true,
    render: (v) => v ? (
      <span className="font-mono text-xs" style={{ color: '#3F9967' }}>
        {new Date(v).toLocaleDateString('en-IN')}
      </span>
    ) : <span className="text-slate-text/30 text-xs">—</span>,
  },
];

export default function ChallansListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const { data, isLoading } = useChallans({
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 20,
  });

  return (
    <AppShell>
      <TopBar
        title="Dispatch Challans"
        actions={
          canCreate && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate('/challans/new')}
            >
              <FilePlus size={15} />
              New Challan
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto' }}
            id="filter-challan-status"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-text/50">From</label>
            <input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); setPage(1); }}
              className="field-input"
              style={{ width: '140px' }}
              id="filter-from"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-text/50">To</label>
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setPage(1); }}
              className="field-input"
              style={{ width: '140px' }}
              id="filter-to"
            />
          </div>

          {(status || from || to) && (
            <button
              onClick={() => { setStatus(''); setFrom(''); setTo(''); setPage(1); }}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              <Filter size={12} /> Clear
            </button>
          )}
        </div>

        <div
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
        >
          <DataTable
            columns={COLUMNS}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No challans yet — create the first dispatch challan to get started."
            onRowClick={(row) => navigate(`/challans/${row.id}`)}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>
    </AppShell>
  );
}
