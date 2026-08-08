import { useNavigate } from 'react-router-dom';
import { useChallans } from '../challans/useChallans';
import { useCustomers } from '../customers/useCustomers';
import { useProducts } from '../products/useProducts';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StatusStamp from '../../components/ui/StatusStamp';
import { Users, Package, FileText, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard — summary cards + recent challans + low stock alerts
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: challans } = useChallans({ limit: 8 });
  const { data: customers } = useCustomers({ limit: 1 });
  const { data: products } = useProducts({ limit: 1 });
  const { data: lowStock } = useProducts({ lowStock: 'true', limit: 20 });
  const { data: draftChallans } = useChallans({ status: 'DRAFT', limit: 5 });
  const { data: confirmedChallans } = useChallans({ status: 'CONFIRMED', limit: 1 });

  const totalCustomers = customers?.meta?.total || 0;
  const totalProducts = products?.meta?.total || 0;
  const totalChallans = challans?.meta?.total || 0;
  const totalConfirmed = confirmedChallans?.meta?.total || 0;
  const lowStockCount = lowStock?.meta?.total || 0;

  return (
    <AppShell>
      <TopBar title="Dashboard" />

      <div className="flex-1 overflow-auto p-6">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-white">
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}.
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Here's your operations snapshot.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Customers"
            value={totalCustomers}
            onClick={() => navigate('/customers')}
            color="#F2A93B"
          />
          <StatCard
            icon={Package}
            label="Products"
            value={totalProducts}
            onClick={() => navigate('/products')}
            color="#7CB9E8"
          />
          <StatCard
            icon={FileText}
            label="Total Challans"
            value={totalChallans}
            onClick={() => navigate('/challans')}
            color="#3F9967"
          />
          <StatCard
            icon={TrendingUp}
            label="Confirmed"
            value={totalConfirmed}
            onClick={() => navigate('/challans?status=CONFIRMED')}
            color="#3F9967"
          />
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div
            className="mb-6 rounded-lg p-4 flex items-start gap-3 cursor-pointer"
            style={{ backgroundColor: 'rgba(242,169,59,0.06)', border: '1px solid rgba(242,169,59,0.2)' }}
            onClick={() => navigate('/products?lowStock=true')}
          >
            <AlertTriangle size={18} style={{ color: '#F2A93B', flexShrink: 0 }} />
            <div>
              <div className="font-semibold text-sm" style={{ color: '#F2A93B' }}>
                {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} below minimum stock
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                {lowStock?.data?.slice(0, 3).map(p => p.sku).join(', ')}{lowStockCount > 3 ? ` and ${lowStockCount - 3} more` : ''} — click to review
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent challans */}
          <div
            className="rounded-lg"
            style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#2B3240' }}
            >
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
                <Activity size={14} className="text-signal-amber" />
                Recent Challans
              </h3>
              <button
                onClick={() => navigate('/challans')}
                className="text-xs text-slate-text/50 hover:text-signal-amber transition-colors"
              >
                View all →
              </button>
            </div>

            <div className="divide-y divide-steel/40">
              {(challans?.data || []).slice(0, 7).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-steel/20 transition-colors"
                  onClick={() => navigate(`/challans/${ch.id}`)}
                >
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">{ch.challan_number}</div>
                    <div className="text-xs text-slate-text/50 mt-0.5">{ch.customer_name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono text-xs text-slate-text/50">
                        {new Date(ch.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <StatusStamp status={ch.status} />
                  </div>
                </div>
              ))}

              {(!challans?.data || challans.data.length === 0) && (
                <div className="px-5 py-8 text-center text-sm italic" style={{ color: '#4A5568' }}>
                  No challans created yet.
                </div>
              )}
            </div>
          </div>

          {/* Draft challans pending action */}
          <div
            className="rounded-lg"
            style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#2B3240' }}
            >
              <h3 className="font-display font-semibold text-sm text-white">
                Draft Challans
                {draftChallans?.meta?.total > 0 && (
                  <span
                    className="ml-2 font-mono text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(242,169,59,0.1)', color: '#F2A93B' }}
                  >
                    {draftChallans.meta.total} pending
                  </span>
                )}
              </h3>
            </div>

            <div className="divide-y divide-steel/40">
              {(draftChallans?.data || []).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-steel/20 transition-colors"
                  onClick={() => navigate(`/challans/${ch.id}`)}
                >
                  <div>
                    <div className="font-mono text-sm font-semibold text-white">{ch.challan_number}</div>
                    <div className="text-xs text-slate-text/50">{ch.customer_name} · {ch.total_quantity} units</div>
                  </div>
                  <div className="text-xs font-mono text-slate-text/40">
                    {new Date(ch.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}

              {(!draftChallans?.data || draftChallans.data.length === 0) && (
                <div className="px-5 py-8 text-center text-sm italic" style={{ color: '#4A5568' }}>
                  No draft challans — all caught up.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg p-5 transition-colors"
      style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color + '40'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2B3240'}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: color + '15' }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div className="font-mono font-bold text-2xl text-white mb-1">{value}</div>
      <div className="text-xs text-slate-text/50">{label}</div>
    </button>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
