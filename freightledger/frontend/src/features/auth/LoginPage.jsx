import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './useAuth';
import { Package } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — full-screen ink background, FreightLedger wordmark, login form
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const [form, setForm] = useState({ email: '', password: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(form, {
      onSuccess: () => navigate('/dashboard'),
    });
  }

  const errorMsg = error?.message || (error ? 'Login failed. Check your credentials.' : null);

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#12151B' }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[420px] flex-shrink-0 border-r"
        style={{ borderColor: '#2B3240', backgroundColor: '#0E1118' }}
      >
        {/* Top: wordmark */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded flex items-center justify-center font-display font-bold text-sm"
              style={{ backgroundColor: '#F2A93B', color: '#12151B' }}
            >
              FL
            </div>
            <div>
              <div
                className="font-display font-bold text-lg tracking-widest uppercase"
                style={{ color: '#F2A93B' }}
              >
                FreightLedger
              </div>
              <div className="text-xs" style={{ color: '#4A5568' }}>
                Operations Portal
              </div>
            </div>
          </div>

          <div
            className="font-display text-3xl font-bold leading-tight mb-4"
            style={{ color: '#EDE6D6' }}
          >
            Your warehouse,<br />
            ledger-perfect.
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            Manage customers, inventory, dispatch challans, and invoices — all in one
            place. Built for the warehouse floor and the accounts office.
          </p>
        </div>

        {/* Bottom: feature list */}
        <div className="space-y-3">
          {[
            'Transactional stock control — never oversell',
            'Dispatch challans with PDF invoice export',
            'CRM with follow-up timeline',
            'Role-based access: Admin, Sales, Warehouse, Accounts',
          ].map((feat) => (
            <div key={feat} className="flex items-start gap-2.5">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: '#F2A93B' }}
              />
              <span className="text-sm" style={{ color: '#9CA3AF' }}>
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm"
              style={{ backgroundColor: '#F2A93B', color: '#12151B' }}
            >
              FL
            </div>
            <span
              className="font-display font-bold tracking-widest uppercase text-base"
              style={{ color: '#F2A93B' }}
            >
              FreightLedger
            </span>
          </div>

          <div className="mb-8">
            <h2
              className="font-display font-bold text-2xl mb-1"
              style={{ color: '#EDE6D6' }}
            >
              Sign in
            </h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Use your assigned credentials to access the portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {errorMsg && (
              <div
                className="px-4 py-3 rounded text-sm"
                style={{
                  backgroundColor: 'rgba(196,80,31,0.1)',
                  border: '1px solid rgba(196,80,31,0.3)',
                  color: '#C4501F',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="field-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="field-input"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full mt-2"
              style={{ padding: '10px' }}
            >
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div
            className="mt-8 p-4 rounded text-xs space-y-1 font-mono"
            style={{
              backgroundColor: '#1B2029',
              border: '1px solid #2B3240',
              color: '#6B7280',
            }}
          >
            <div className="font-sans text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>
              Demo accounts
            </div>
            {[
              ['admin@freightledger.com',     'Admin@1234',     'ADMIN'],
              ['sales@freightledger.com',     'Sales@1234',     'SALES'],
              ['warehouse@freightledger.com', 'Warehouse@1234', 'WAREHOUSE'],
              ['accounts@freightledger.com',  'Accounts@1234',  'ACCOUNTS'],
            ].map(([email, pass, role]) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ email, password: pass })}
                className="block w-full text-left hover:text-signal-amber transition-colors"
                style={{ color: '#6B7280' }}
              >
                <span style={{ color: '#F2A93B' }}>{role}</span>
                {' '}{email} / {pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
