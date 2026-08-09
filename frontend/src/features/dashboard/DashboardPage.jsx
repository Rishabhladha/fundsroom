import { useNavigate } from 'react-router-dom';
import { useChallans } from '../challans/useChallans';
import { useCustomers } from '../customers/useCustomers';
import { useProducts } from '../products/useProducts';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StatusStamp from '../../components/ui/StatusStamp';
import { Users, Package, FileText, TrendingUp, AlertTriangle, ArrowRight, Clock } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: challans }          = useChallans({ limit: 8 });
  const { data: customers }         = useCustomers({ limit: 1 });
  const { data: products }          = useProducts({ limit: 1 });
  const { data: lowStock }          = useProducts({ lowStock: 'true', limit: 20 });
  const { data: draftChallans }     = useChallans({ status: 'DRAFT', limit: 5 });
  const { data: confirmedChallans } = useChallans({ status: 'CONFIRMED', limit: 1 });

  const totalCustomers = customers?.meta?.total || 0;
  const totalProducts  = products?.meta?.total || 0;
  const totalChallans  = challans?.meta?.total || 0;
  const totalConfirmed = confirmedChallans?.meta?.total || 0;
  const lowStockCount  = lowStock?.meta?.total || 0;

  return (
    <AppShell>
      <TopBar title="Dashboard" />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Greeting strip */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.02em' }}>
            Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Here's what's happening with your operations today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users}      label="Customers"  value={totalCustomers} accent="#6C63FF" onClick={() => navigate('/customers')} />
          <StatCard icon={Package}    label="Products"   value={totalProducts}  accent="#0EA5E9" onClick={() => navigate('/products')} />
          <StatCard icon={FileText}   label="Challans"   value={totalChallans}  accent="#10B981" onClick={() => navigate('/challans')} />
          <StatCard icon={TrendingUp} label="Confirmed"  value={totalConfirmed} accent="#F59E0B" onClick={() => navigate('/challans?status=CONFIRMED')} />
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <button
            className="w-full mb-6 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors"
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
            }}
            onClick={() => navigate('/products?lowStock=true')}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF3C7'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFBEB'}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FEF3C7' }}>
              <AlertTriangle size={15} style={{ color: '#D97706' }} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: '#92400E' }}>
                {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} running low on stock
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: '#B45309' }}>
                {lowStock?.data?.slice(0, 4).map(p => p.name).join(', ')}{lowStockCount > 4 ? ` + ${lowStockCount - 4} more` : ''} — click to review
              </div>
            </div>
            <ArrowRight size={14} style={{ color: '#D97706', flexShrink: 0 }} />
          </button>
        )}

        {/* Two-column panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Challans */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--edge)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--violet-light)' }}>
                  <FileText size={12} style={{ color: 'var(--violet)' }} strokeWidth={2.5} />
                </div>
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>
                  Recent Challans
                </span>
              </div>
              <button
                className="text-xs font-medium flex items-center gap-1 transition-colors"
                style={{ color: 'var(--violet)' }}
                onClick={() => navigate('/challans')}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div>
              {(challans?.data || []).slice(0, 7).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--edge)' }}
                  onClick={() => navigate(`/challans/${ch.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div className="font-mono text-sm font-semibold" style={{ color: 'var(--ink-dark)' }}>{ch.challan_number}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{ch.customer_name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {new Date(ch.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <StatusStamp status={ch.status} />
                  </div>
                </div>
              ))}
              {(!challans?.data || challans.data.length === 0) && (
                <div className="px-5 py-10 text-center text-sm italic" style={{ color: 'var(--ink-muted)' }}>
                  No challans yet.
                </div>
              )}
            </div>
          </div>

          {/* Pending Drafts */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--edge)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#FFFBEB' }}>
                  <Clock size={12} style={{ color: '#D97706' }} strokeWidth={2.5} />
                </div>
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--ink-dark)' }}>
                  Pending Drafts
                </span>
                {draftChallans?.meta?.total > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
                    {draftChallans.meta.total}
                  </span>
                )}
              </div>
            </div>
            <div>
              {(draftChallans?.data || []).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--edge)' }}
                  onClick={() => navigate(`/challans/${ch.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFFBEB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div className="font-mono text-sm font-semibold" style={{ color: 'var(--ink-dark)' }}>{ch.challan_number}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{ch.customer_name} · {ch.total_quantity} units</div>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {new Date(ch.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
              {(!draftChallans?.data || draftChallans.data.length === 0) && (
                <div className="px-5 py-10 text-center text-sm italic" style={{ color: 'var(--ink-muted)' }}>
                  All caught up — no pending drafts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left card p-5 transition-all w-full"
      style={{ '--accent': accent }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: accent + '15' }}
      >
        <Icon size={18} style={{ color: accent }} strokeWidth={2} />
      </div>
      <div className="font-display font-bold text-2xl" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.03em' }}>
        {value.toLocaleString('en-IN')}
      </div>
      <div className="text-xs font-medium mt-1" style={{ color: 'var(--ink-soft)' }}>{label}</div>
    </button>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
