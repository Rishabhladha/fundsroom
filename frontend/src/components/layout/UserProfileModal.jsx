import { useState, useEffect } from 'react';
import Drawer from '../ui/Drawer';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { User, KeyRound, ShieldCheck } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setPassword('');
      setNewPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.patch('/auth/profile', {
        name,
        password: password || undefined,
        newPassword: newPassword || undefined,
      });

      updateUser({ name: res.data.name });
      setSuccess('Profile updated successfully!');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Account Settings">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-xs px-3 py-2 rounded bg-rust-alert/10 text-rust-alert border border-rust-alert/30">
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs px-3 py-2 rounded bg-ledger-green/10 text-ledger-green border border-ledger-green/30">
            {success}
          </div>
        )}

        <div className="p-4 rounded-lg bg-steel/30 border border-steel flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-signal-amber/20 text-signal-amber flex items-center justify-center font-display font-bold text-sm">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{user?.name}</div>
            <div className="font-mono text-xs text-slate-text/60">{user?.email}</div>
            <div className="inline-flex items-center gap-1 font-mono text-[10px] text-signal-amber mt-0.5">
              <ShieldCheck size={11} /> {user?.role}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-text/60 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="pt-3 border-t border-steel space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-text/80">
            <KeyRound size={13} className="text-signal-amber" /> Change Password
          </div>

          <div>
            <label className="block text-xs text-slate-text/50 mb-1">Current Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-text/50 mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              className="field-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-steel">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : 'Update Profile'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </form>
    </Drawer>
  );
}
