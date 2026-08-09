import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallans } from './useChallans';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import StatusStamp from '../../components/ui/StatusStamp';
import { FilePlus, X } from 'lucide-react';

const COLUMNS = [
  {
    key: 'challan_number',
    header: 'Challan No.',
    render: (v) => <span className="font-mono text-sm font-bold" style={{ color: 'var(--ink-dark)' }}>{v}</span>,
  },
  {
    key: 'customer_name',
    header: 'Customer',
    render: (v) => <span className="font-medium text-sm" style={{ color: 'var(--ink-dark)' }}>{v}</span>,
  },
  { key: 'status', header: 'Status', render: (v) => <StatusStamp status={v} /> },
  {
    key: 'total_quantity',
    header: 'Qty',
    align: 'right',
    render: (v) => <span className="font-mono font-semibold" style={{ color: 'var(--ink-dark)' }}>{v}</span>,
  },
  {
    key: 'created_by_name',
    header: 'Created By',
    render: (v) => <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>{v}</span>,
  },
  {
    key: 'created_at',
    header: 'Date',
    render: (v) => (
      <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
        {new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'confirmed_at',
    header: 'Confirmed',
    render: (v) => v
      ? <span className="font-mono text-xs font-semibold" style={{ color: '#059669' }}>{new Date(v).toLocaleDateString('en-IN')}</span>
      : <span style={{ color: 'var(--ink-muted)' }}>—</span>,
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
  const { data, isLoading } = useChallans({ status: status || undefined, from: from || undefined, to: to || undefined, page, limit: 20 });
  const hasFilters = status || from || to;

  return (
    <AppShell>
      <TopBar
        title="Dispatch Challans"
        actions={canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            <FilePlus size={14} strokeWidth={2.5} />
            New Challan
          </button>
        )}
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Filters */}
        <div className="card flex flex-wrap items-center gap-3 p-3 mb-4">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="field-input"
            style={{ width: 'auto', minWidth: '150px' }}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>From</span>
            <input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); setPage(1); }}
              className="field-input"
              style={{ width: '145px' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>To</span>
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setPage(1); }}
              className="field-input"
              style={{ width: '145px' }}
            />
          </div>

          {hasFilters && (
            <button onClick={() => { setStatus(''); setFrom(''); setTo(''); setPage(1); }} className="btn btn-ghost text-xs gap-1.5">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          <DataTable
            columns={COLUMNS}
            data={data?.data || []}
            loading={isLoading}
            emptyMessage="No challans yet — create your first dispatch challan."
            onRowClick={(row) => navigate(`/challans/${row.id}`)}
          />
          <Pagination meta={data?.meta} onPage={setPage} />
        </div>
      </div>
    </AppShell>
  );
}
