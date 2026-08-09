import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { X, User, KeyRound, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
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

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const ROLE_COLORS = {
    ADMIN:     { color: '#D97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)' },
    SALES:     { color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)', border: 'rgba(14,165,233,0.25)' },
    WAREHOUSE: { color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' },
    ACCOUNTS:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)' },
  };
  const roleStyle = ROLE_COLORS[user?.role] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)' };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2"
        style={{ transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '440px', animation: 'fadeUp 200ms cubic-bezier(0.16,1,0.3,1)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Account Settings"
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--edge)' }}>

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--edge)' }}
          >
            <div>
              <div className="font-display font-bold text-base" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.01em' }}>
                Account Settings
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                Manage your profile and security
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--ink-soft)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--edge)'; e.currentTarget.style.color = 'var(--ink-dark)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar strip */}
          <div className="flex items-center gap-4 px-6 py-5" style={{ borderBottom: '1px solid var(--edge)', background: '#FFFFFF' }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
            >
              {initials}
            </div>
            <div>
              <div className="font-display font-bold text-base" style={{ color: 'var(--ink-dark)' }}>{user?.name}</div>
              <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{user?.email}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <ShieldCheck size={11} style={{ color: roleStyle.color }} />
                <span
                  className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: roleStyle.color, background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">

              {/* Alert messages */}
              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                  <CheckCircle size={15} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--ink-soft)' }}>
                  <User size={11} />
                  Display Name
                </label>
                <input
                  type="text" required
                  className="field-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              {/* Password section */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--edge)' }}>
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--edge)' }}
                >
                  <KeyRound size={13} style={{ color: '#2563EB' }} strokeWidth={2.5} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>
                    Change Password
                  </span>
                  <span className="ml-auto text-xs italic" style={{ color: 'var(--ink-muted)' }}>optional</span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        className="field-input pr-10"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-dark)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
                      >
                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>New Password <span className="font-normal italic">(min 8 characters)</span></label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        className="field-input pr-10"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-dark)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-muted)'}
                      >
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {/* Password strength hint */}
                    {newPassword.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-colors"
                            style={{
                              background: newPassword.length >= i * 3
                                ? newPassword.length >= 12 ? '#10B981' : newPassword.length >= 8 ? '#F59E0B' : '#EF4444'
                                : 'var(--edge)',
                            }}
                          />
                        ))}
                        <span className="text-xs ml-1 font-mono" style={{ color: newPassword.length >= 12 ? '#10B981' : newPassword.length >= 8 ? '#F59E0B' : '#EF4444' }}>
                          {newPassword.length >= 12 ? 'Strong' : newPassword.length >= 8 ? 'Good' : 'Weak'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button type="submit" disabled={loading} className="btn btn-primary flex-1" style={{ padding: '10px' }}>
                {loading ? 'Saving changes…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => onClose()} className="btn btn-ghost" style={{ padding: '10px 20px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
