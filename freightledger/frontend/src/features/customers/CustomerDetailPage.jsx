import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useUpdateCustomer } from './useCustomers';
import { useChallans } from '../challans/useChallans';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import StatusStamp from '../../components/ui/StatusStamp';
import CustomerFormDrawer from './CustomerFormDrawer';
import FollowUpTimeline from './FollowUpTimeline';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building2, Hash } from 'lucide-react';
import { TYPE_COLORS } from '../../theme/tokens';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading } = useCustomer(id);
  const { data: challansData } = useChallans({ customerId: id, limit: 5 });

  const [editOpen, setEditOpen] = useState(false);

  const customer = data?.data;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  if (isLoading) {
    return (
      <AppShell>
        <TopBar title="Customer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-text/50 font-mono text-sm animate-pulse">Loading…</div>
        </div>
      </AppShell>
    );
  }

  if (!customer) {
    return (
      <AppShell>
        <TopBar title="Customer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-rust-alert font-mono text-sm">Customer not found.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar
        title={customer.name}
        actions={
          canEdit && (
            <button className="btn-ghost flex items-center gap-2" onClick={() => setEditOpen(true)}>
              <Edit size={14} />
              Edit
            </button>
          )
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Back link */}
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-1.5 text-sm text-slate-text/60 hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft size={14} />
          All Customers
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: details card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Identity card */}
            <div
              className="rounded-lg p-5"
              style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">{customer.name}</h2>
                  {customer.business_name && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-text/60">
                      <Building2 size={13} />
                      {customer.business_name}
                    </div>
                  )}
                </div>
                <StatusStamp status={customer.status} />
              </div>

              {/* Type badge */}
              <div className="mb-4">
                <span
                  className="font-mono text-xs px-2.5 py-1 rounded"
                  style={{
                    color: TYPE_COLORS[customer.type] || '#C7CCD6',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${TYPE_COLORS[customer.type] || '#2B3240'}30`,
                  }}
                >
                  {customer.type}
                </span>
              </div>

              {/* Contact details */}
              <div className="space-y-2.5">
                <InfoRow icon={Phone} label="Mobile" value={customer.mobile} mono />
                {customer.email && <InfoRow icon={Mail} label="Email" value={customer.email} />}
                {customer.gst_number && <InfoRow icon={Hash} label="GST" value={customer.gst_number} mono />}
                {customer.address && <InfoRow icon={MapPin} label="Address" value={customer.address} />}
              </div>

              {customer.follow_up_date && (
                <div
                  className="mt-4 px-3 py-2 rounded text-xs font-mono"
                  style={{
                    backgroundColor: 'rgba(242,169,59,0.08)',
                    border: '1px solid rgba(242,169,59,0.2)',
                    color: '#F2A93B',
                  }}
                >
                  Follow-up: {new Date(customer.follow_up_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-steel">
                <div className="text-xs font-mono text-slate-text/40">
                  Added {new Date(customer.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Recent challans */}
            {challansData?.data?.length > 0 && (
              <div
                className="rounded-lg p-5"
                style={{ backgroundColor: '#1B2029', border: '1px solid #2B3240' }}
              >
                <h3 className="font-display font-semibold text-sm text-white mb-3">
                  Recent Challans
                </h3>
                <div className="space-y-2">
                  {challansData.data.slice(0, 5).map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => navigate(`/challans/${ch.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-steel/30 transition-colors"
                    >
                      <span className="font-mono text-xs text-slate-text">{ch.challan_number}</span>
                      <StatusStamp status={ch.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: follow-up timeline */}
          <div className="lg:col-span-2">
            <FollowUpTimeline customerId={id} canAdd={canEdit} />
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
      <Icon size={13} className="text-slate-text/40 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-slate-text/40 mb-0.5">{label}</div>
        <div className={`text-sm text-slate-text ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
    </div>
  );
}
