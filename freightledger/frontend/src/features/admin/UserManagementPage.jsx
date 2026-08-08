import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import AppShell from '../../components/layout/AppShell';
import TopBar from '../../components/layout/TopBar';
import Drawer from '../../components/ui/Drawer';
import DataTable from '../../components/ui/DataTable';
import { UserPlus, UserX, UserCheck, Shield, Mail, Key } from 'lucide-react';

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

  const columns = [
    {
      key: 'name',
      header: 'Employee Name',
      render: (v, row) => (
        <div>
          <div className="font-semibold text-white">{v}</div>
          <div className="font-mono text-xs text-slate-text/50">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      render: (v) => (
        <span
          className={`font-mono text-xs px-2.5 py-1 rounded font-semibold border ${
            v === 'ADMIN'
              ? 'bg-signal-amber/10 text-signal-amber border-signal-amber/30'
              : v === 'SALES'
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
              : v === 'WAREHOUSE'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (v) => (
        <span
          className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
            v ? 'bg-ledger-green/10 text-ledger-green border border-ledger-green/30' : 'bg-rust-alert/10 text-rust-alert border border-rust-alert/30'
          }`}
        >
          {v ? 'ACTIVE' : 'DEACTIVATED'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined Date',
      mono: true,
      render: (v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`${row.is_active ? 'Deactivate' : 'Activate'} user account for ${row.name}?`)) {
              toggleStatus({ id: row.id, is_active: !row.is_active });
            }
          }}
          className={`btn-ghost text-xs px-2.5 py-1 flex items-center gap-1.5 ml-auto ${
            row.is_active ? 'hover:text-rust-alert hover:border-rust-alert/50' : 'hover:text-ledger-green hover:border-ledger-green/50'
          }`}
        >
          {row.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
          {row.is_active ? 'Revoke Access' : 'Activate'}
        </button>
      ),
    },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    createUser(form);
  }

  return (
    <AppShell>
      <TopBar
        title="User & Team Account Management"
        actions={
          <button className="btn-primary flex items-center gap-2" onClick={() => setCreateOpen(true)}>
            <UserPlus size={15} />
            Create Team Account
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 text-xs text-slate-text/60">
          Admin Control Center: Create initial credentials for new employees or revoke access immediately when team members leave.
        </div>

        <div className="rounded-lg overflow-hidden border border-steel bg-ink-raised">
          <DataTable
            columns={columns}
            data={users}
            loading={isLoading}
            emptyMessage="No team users found."
          />
        </div>
      </div>

      <Drawer isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Provision New User Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-xs px-3 py-2 rounded bg-rust-alert/10 text-rust-alert border border-rust-alert/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
              Employee Full Name *
            </label>
            <input
              type="text"
              required
              className="field-input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
              Company Email Address *
            </label>
            <input
              type="email"
              required
              className="field-input"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="ramesh@freightledger.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
                Assign System Role *
              </label>
              <select
                className="field-input"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="SALES">SALES</option>
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="ACCOUNTS">ACCOUNTS</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="field-input"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="text-xs text-slate-text/50 font-mono bg-steel/20 p-2.5 rounded">
            💡 Provide these initial credentials to the employee. They can change their password at any time in their profile settings.
          </div>

          <div className="flex gap-3 pt-3">
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? 'Provisioning…' : 'Create Account'}
            </button>
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
}
