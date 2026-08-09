import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Drawer from '../../components/ui/Drawer';
import { UserPlus, UserX, UserCheck, Shield, Users } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN:     { color: '#D97706', bg: 'rgba(217,119,6,0.12)',  border: 'rgba(217,119,6,0.3)',  dot: '#D97706' },
  SALES:     { color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)', border: 'rgba(14,165,233,0.3)', dot: '#0EA5E9' },
  WAREHOUSE: { color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.3)', dot: '#10B981' },
  ACCOUNTS:  { color: '#A855F7', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.3)', dot: '#A855F7' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', dot: '#6B7280' };
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
  const cfg = ROLE_CONFIG[role] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
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

  const users = data?.data || [];
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
              <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>Total accounts</div>
            </div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--edge)' }} />
          <div>
            <div className="font-mono font-bold text-lg" style={{ color: '#10B981' }}>{activeCount}</div>
            <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>Active</div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--edge)' }} />
          <div>
            <div className="font-mono font-bold text-lg" style={{ color: '#EF4444' }}>{users.length - activeCount}</div>
            <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>Deactivated</div>
          </div>
        </div>

        {/* User cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-2/3" />
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
            {users.map((user) => (
              <div
                key={user.id}
                className="card p-5 flex flex-col gap-4"
                style={{ opacity: user.is_active ? 1 : 0.6 }}
              >
                {/* Card header */}
                <div className="flex items-start gap-3">
                  <UserInitials name={user.name} role={user.role} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold text-sm truncate" style={{ color: 'var(--ink-dark)' }}>
                      {user.name}
                    </div>
                    <div className="font-mono text-xs mt-0.5 truncate" style={{ color: 'var(--ink-soft)' }}>
                      {user.email}
                    </div>
                  </div>
                  {/* Active dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                    style={{ background: user.is_active ? '#10B981' : '#EF4444', boxShadow: user.is_active ? '0 0 0 3px rgba(16,185,129,0.15)' : '0 0 0 3px rgba(239,68,68,0.15)' }}
                    title={user.is_active ? 'Active' : 'Deactivated'}
                  />
                </div>

                {/* Role + joined */}
                <div className="flex items-center justify-between">
                  <RoleBadge role={user.role} />
                  <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--edge)' }} />

                {/* Action */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${user.is_active ? 'Deactivate' : 'Activate'} account for ${user.name}?`)) {
                      toggleStatus({ id: user.id, is_active: !user.is_active });
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={user.is_active
                    ? { color: '#EF4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }
                    : { color: '#10B981', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }
                  }
                  onMouseEnter={e => e.currentTarget.style.background = user.is_active ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = user.is_active ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)'}
                >
                  {user.is_active ? <UserX size={13} strokeWidth={2.5} /> : <UserCheck size={13} strokeWidth={2.5} />}
                  {user.is_active ? 'Revoke Access' : 'Activate Account'}
                </button>
              </div>
            ))}
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
              {/* Role preview */}
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

          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--violet-light)', color: 'var(--violet)', border: '1px solid #C7D2FE' }}>
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
