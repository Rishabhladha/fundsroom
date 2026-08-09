import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './useAuth';
import { Zap, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(form, { onSuccess: () => navigate('/dashboard') });
  }

  const errorMsg = error?.message || (error ? 'Login failed. Check your credentials.' : null);

  const FEATURES = [
    'Transactional stock control — never oversell',
    'Dispatch challans with PDF invoice export',
    'CRM with follow-up timeline tracking',
    'Role-based access for your whole team',
  ];

  const DEMO_ACCOUNTS = [
    { email: 'admin@freightledger.com', password: 'Admin@1234', role: 'ADMIN' },
    { email: 'sales@freightledger.com', password: 'Sales@1234', role: 'SALES' },
    { email: 'warehouse@freightledger.com', password: 'Warehouse@1234', role: 'WAREHOUSE' },
    { email: 'accounts@freightledger.com', password: 'Accounts@1234', role: 'ACCOUNTS' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--canvas)' }}>
      {/* Left panel — navy branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 flex-shrink-0"
        style={{ width: '400px', background: 'var(--navy)' }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--violet)', boxShadow: '0 0 0 4px rgba(108,99,255,0.25)' }}
            >
              <Zap size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-base tracking-widest uppercase text-white">
                FreightLedger
              </div>
              <div className="text-[11px] font-mono" style={{ color: '#4A6A8A' }}>
                Operations Portal
              </div>
            </div>
          </div>

          <h1 className="font-display font-bold text-3xl leading-tight mb-3 text-white" style={{ letterSpacing: '-0.02em' }}>
            Your warehouse,<br />
            ledger-perfect.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#8EA7C4' }}>
            Manage inventory, dispatch challans, and customer relationships — all in one place.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <CheckCircle size={14} style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: '2px' }} />
              <span className="text-sm" style={{ color: '#8EA7C4' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="font-mono text-xs" style={{ color: '#2C4A6A' }}>
          FreightLedger © {new Date().getFullYear()}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--violet)' }}>
              <Zap size={14} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-display font-bold tracking-widest uppercase text-base" style={{ color: 'var(--ink-dark)' }}>FreightLedger</span>
          </div>

          <div className="mb-7">
            <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--ink-dark)', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
              Sign in with your assigned credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Email Address
              </label>
              <input
                id="email" name="email" type="email"
                autoComplete="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@company.com"
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--ink-soft)' }}>
                Password
              </label>
              <input
                id="password" name="password" type="password"
                autoComplete="current-password" required
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="field-input"
              />
            </div>

            <button type="submit" disabled={isPending} className="btn btn-primary w-full mt-1" style={{ padding: '10px', fontSize: '14px' }}>
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 rounded-xl overflow-hidden" style={{ border: '1px solid var(--edge)' }}>
            <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-widest" style={{ background: 'var(--surface-2)', color: 'var(--ink-soft)', borderBottom: '1px solid var(--edge)' }}>
              Demo accounts
            </div>
            {DEMO_ACCOUNTS.map(({ email, password, role }) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ email, password })}
                className="w-full text-left px-4 py-2.5 font-mono text-xs transition-colors"
                style={{ borderBottom: '1px solid var(--edge)', color: 'var(--ink-soft)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="font-bold" style={{ color: 'var(--violet)' }}>{role}</span>
                {'  '}
                <span style={{ color: 'var(--ink-muted)' }}>{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
