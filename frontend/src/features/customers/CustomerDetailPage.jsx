import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from './useCustomers';
import { useChallans } from '../challans/useChallans';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StatusStamp from '../../components/ui/StatusStamp';
import CustomerFormDrawer from './CustomerFormDrawer';
import FollowUpTimeline from './FollowUpTimeline';
import CustomerLedger from './CustomerLedger';
import { ArrowLeft, Edit3, Phone, Mail, MapPin, Building2, Hash, CreditCard, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { TYPE_COLORS } from '../../theme/tokens';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading } = useCustomer(id);
  const { data: challansData } = useChallans({ customerId: id, limit: 5 });

  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('TIMELINE');

  const customer = data?.data;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  if (isLoading) {
    return (
      <AppShell>
        <TopBar title="Customer Details" />
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
          <div className="skeleton h-4 w-40" />
        </div>
      </AppShell>
    );
  }

  if (!customer) {
    return (
      <AppShell>
        <TopBar title="Customer Details" />
        <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--canvas)' }}>
          <div className="text-sm font-mono" style={{ color: 'var(--crimson)' }}>Customer not found.</div>
        </div>
      </AppShell>
    );
  }

  const billed = parseFloat(customer.total_billed || 0);
  const paid = parseFloat(customer.total_paid || 0);
  const balance = parseFloat(customer.outstanding_balance || 0);

  return (
    <AppShell>
      <TopBar
        title={customer.name}
        actions={
          canEdit && (
            <button className="btn btn-ghost text-sm gap-1.5" onClick={() => setEditOpen(true)}>
              <Edit3 size={14} strokeWidth={2} />
              Edit Customer
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Back navigation */}
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-1.5 text-sm mb-5 transition-colors font-medium"
          style={{ color: 'var(--ink-soft)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-soft)'}
        >
          <ArrowLeft size={14} /> Back to Customers
        </button>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Total Billed</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet-light)' }}>
                <TrendingUp size={14} style={{ color: 'var(--violet)' }} />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: 'var(--ink-dark)' }}>
              ₹{billed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Total Paid</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ECFDF5' }}>
                <DollarSign size={14} style={{ color: '#059669' }} />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#059669' }}>
              ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>
                {balance < 0 ? 'Advance Credit' : 'Outstanding Balance'}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: balance > 0 ? '#FEF2F2' : '#ECFDF5' }}>
                <CreditCard size={14} style={{ color: balance > 0 ? '#EF4444' : '#059669' }} />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold flex items-baseline gap-2" style={{ color: balance > 0 ? '#EF4444' : '#059669' }}>
              <span>₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              {balance < 0 && <span className="text-xs font-sans font-semibold text-emerald-600">(Credit Balance)</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Customer Profile Details */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-lg" style={{ color: 'var(--ink-dark)' }}>{customer.name}</h2>
                  {customer.business_name && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>
                      <Building2 size={13} />
                      {customer.business_name}
                    </div>
                  )}
                </div>
                <StatusStamp status={customer.status} />
              </div>

              {/* Type tag */}
              <div className="mb-4">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    color: TYPE_COLORS[customer.type]?.color || '#475569',
                    background: TYPE_COLORS[customer.type]?.bg || '#E2E8F0',
                  }}
                >
                  {customer.type}
                </span>
              </div>

              {/* Contact info list */}
              <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--edge)' }}>
                <InfoRow icon={Phone} label="Mobile" value={customer.mobile} mono />
                {customer.email && <InfoRow icon={Mail} label="Email" value={customer.email} />}
                {customer.gst_number && <InfoRow icon={Hash} label="GST Number" value={customer.gst_number} mono />}
                {customer.address && <InfoRow icon={MapPin} label="Address" value={customer.address} />}
              </div>

              {customer.follow_up_date && (
                <div
                  className="mt-4 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706' }}
                >
                  Next Follow-up: {new Date(customer.follow_up_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>
              )}

              <div className="mt-4 pt-3 text-xs font-mono" style={{ borderTop: '1px solid var(--edge)', color: 'var(--ink-muted)' }}>
                Added {new Date(customer.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>

            {/* Recent Challans */}
            {challansData?.data?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-sm mb-3" style={{ color: 'var(--ink-dark)' }}>
                  Recent Dispatch Challans
                </h3>
                <div className="space-y-2">
                  {challansData.data.slice(0, 5).map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => navigate(`/challans/${ch.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors"
                      style={{ border: '1px solid var(--edge)', background: 'var(--surface-2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    >
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--ink-dark)' }}>{ch.challan_number}</span>
                      <StatusStamp status={ch.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tabs for Follow-up Timeline & Ledger */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="flex" style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface-2)' }}>
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold transition-all"
                  style={activeTab === 'TIMELINE'
                    ? { background: 'var(--surface)', color: 'var(--violet)', borderBottom: '2px solid var(--violet)' }
                    : { color: 'var(--ink-soft)' }
                  }
                >
                  <Activity size={15} />
                  Timeline & Follow-ups
                </button>
                <button
                  onClick={() => setActiveTab('LEDGER')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold transition-all"
                  style={activeTab === 'LEDGER'
                    ? { background: 'var(--surface)', color: 'var(--violet)', borderBottom: '2px solid var(--violet)' }
                    : { color: 'var(--ink-soft)' }
                  }
                >
                  <CreditCard size={15} />
                  Statement of Account
                </button>
              </div>

              <div>
                {activeTab === 'TIMELINE' && (
                  <div className="p-6">
                    <FollowUpTimeline customerId={id} canAdd={canEdit} />
                  </div>
                )}
                {activeTab === 'LEDGER' && (
                  <CustomerLedger customerId={id} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerFormDrawer
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        customer={customer}
      />
    </AppShell>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--ink-muted)' }} />
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>{label}</div>
        <div className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--ink-dark)' }}>{value}</div>
      </div>
    </div>
  );
}
