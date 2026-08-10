import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Drawer from '../../components/ui/Drawer';
import { UserPlus, UserX, UserCheck, Shield, Users, CheckCircle, Lock } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN:     { color: '#D97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.25)',  dot: '#D97706' },
  SALES:     { color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)', border: 'rgba(14,165,233,0.25)', dot: '#0EA5E9' },
  WAREHOUSE: { color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', dot: '#10B981' },
  ACCOUNTS:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', dot: '#8B5CF6' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', dot: '#64748B' };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {role}
    </span>
  );
}

function UserInitials({ name, role }) {
  const cfg = ROLE_CONFIG[role] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border || 'transparent'}` }}
    >
      {initials}
    </div>
  );
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES' });
  const [error, setError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.get('/auth/users'),
  });

  const { mutate: createUser, isPending: creating } = useMutation({
    mutationFn: (body) => api.post('/auth/users', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setCreateOpen(false);
      setForm({ name: '', email: '', password: '', role: 'SALES' });
      setError(null);
    },
    onError: (err) => setError(err.message || 'Failed to create user account'),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, is_active }) => api.patch(`/auth/users/${id}/status`, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-list'] }),
  });

  const rawUsers = data?.data || [];

  // Sort users: ACTIVE first, DEACTIVATED at the bottom
  const users = [...rawUsers].sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));

  const activeCount = users.filter(u => u.is_active).length;

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    createUser(form);
  }

  return (
    <AppShell>
      <TopBar
        title="Team & Users"
        actions={
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <UserPlus size={14} strokeWidth={2.5} />
            Add Team Member
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--canvas)' }}>
        {/* Summary bar */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--violet-light)' }}>
              <Users size={14} style={{ color: 'var(--violet)' }} />
            </div>
            <div>
              <div className="font-display font-bold text-lg" style={{ color: 'var(--ink-dark)' }}>{users.length}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Total accounts</div>
            </div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--edge)' }} />
          <div>
            <div className="font-mono font-bold text-lg" style={{ color: '#10B981' }}>{activeCount}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Active</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--edge)' }} />
          <div>
            <div className="font-mono font-bold text-lg" style={{ color: '#EF4444' }}>{users.length - activeCount}</div>
            <div className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>Deactivated</div>
          </div>
        </div>

        {/* User cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <Shield size={32} className="mx-auto mb-3" style={{ color: 'var(--ink-muted)' }} />
            <div className="text-sm italic" style={{ color: 'var(--ink-muted)' }}>No team accounts yet. Add your first team member.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((member) => {
              const isSelf = member.id === currentUser?.id || member.role === 'ADMIN';

              return (
                <div
                  key={member.id}
                  className="card p-5 flex flex-col gap-4"
                  style={!member.is_active ? { border: '1.5px solid #FECACA', background: '#FFF5F5' } : {}}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3">
                    <UserInitials name={member.name} role={member.role} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-semibold text-sm truncate flex items-center gap-1.5" style={{ color: 'var(--ink-dark)' }}>
                        <span>{member.name}</span>
                        {member.id === currentUser?.id && (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded" style={{ background: 'var(--violet-light)', color: 'var(--violet)' }}>
                            You
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs mt-0.5 truncate" style={{ color: 'var(--ink-soft)' }}>
                        {member.email}
                      </div>
                    </div>
                    {/* Status badge */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                      style={{ background: member.is_active ? '#10B981' : '#EF4444', boxShadow: member.is_active ? '0 0 0 3px rgba(16,185,129,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)' }}
                      title={member.is_active ? 'Active' : 'Deactivated'}
                    />
                  </div>

                  {/* Role + joined */}
                  <div className="flex items-center justify-between">
                    <RoleBadge role={member.role} />
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {new Date(member.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid var(--edge)' }} />

                  {/* Action */}
                  {isSelf ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200">
                      <Lock size={12} />
                      Protected Admin Account
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toggleStatus({ id: member.id, is_active: !member.is_active });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                      style={member.is_active
                        ? { color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }
                        : { color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0' }
                      }
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      {member.is_active ? <UserX size={14} strokeWidth={2.5} /> : <UserCheck size={14} strokeWidth={2.5} />}
                      {member.is_active ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create drawer */}
      <Drawer isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Team Member">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
              Full Name *
            </label>
            <input
              type="text" required
              className="field-input"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
              Email Address *
            </label>
            <input
              type="email" required
              className="field-input"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="ramesh@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Role *
              </label>
              <select
                className="field-input"
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              >
                <option value="SALES">SALES</option>
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="ACCOUNTS">ACCOUNTS</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {form.role && (
                <div className="mt-2">
                  <RoleBadge role={form.role} />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Initial Password *
              </label>
              <input
                type="password" required minLength={8}
                className="field-input"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="min. 8 characters"
              />
            </div>
          </div>

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--violet-light)', color: 'var(--violet)', border: '1px solid #BFDBFE' }}>
            💡 Share these credentials with the employee. They can update their password anytime from their profile.
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={creating} className="btn btn-primary flex-1">
              {creating ? 'Creating account…' : 'Create Account'}
            </button>
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
}
