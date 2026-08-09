import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './useAuth';
import { Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

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
    'Transactional stock control — zero overselling',
    'Dispatch challans with instant PDF export',
    'Customer ledger & follow-up timelines',
    'Multi-role access: Admin, Sales, Warehouse, Accounts',
  ];

  const DEMO_ACCOUNTS = [
    { email: 'admin@freightledger.com', password: 'Admin@1234', role: 'ADMIN', color: '#2563EB' },
    { email: 'sales@freightledger.com', password: 'Sales@1234', role: 'SALES', color: '#0EA5E9' },
    { email: 'warehouse@freightledger.com', password: 'Warehouse@1234', role: 'WAREHOUSE', color: '#D97706' },
    { email: 'accounts@freightledger.com', password: 'Accounts@1234', role: 'ACCOUNTS', color: '#059669' },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 15% 20%, #E0F2FE 0%, #F1F5F9 100%)',
      }}
    >
      {/* Soft decorative background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-50 pointer-events-none" style={{ background: '#BAE6FD' }} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none" style={{ background: '#DBEAFE' }} />

      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10"
        style={{
          boxShadow: '0 12px 40px -10px rgba(37, 99, 235, 0.12), 0 0 0 1px #CBD5E1',
          background: '#FFFFFF',
        }}
      >
        {/* Left panel — light blue branding hero */}
        <div
          className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 50%, #DBEAFE 100%)',
            borderRight: '1px solid #BFDBFE',
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                <Zap size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display font-bold text-base tracking-widest uppercase" style={{ color: '#0F172A' }}>
                  FreightLedger
                </div>
                <div className="text-[11px] font-mono font-medium" style={{ color: '#0284C7' }}>
                  Operations Portal v3.0
                </div>
              </div>
            </div>

            <h1 className="font-display font-bold text-2xl lg:text-3xl leading-tight mb-3" style={{ color: '#0F172A', letterSpacing: '-0.03em' }}>
              Your warehouse,<br />ledger-perfect.
            </h1>
            <p className="text-xs leading-relaxed mb-8 font-normal" style={{ color: '#334155' }}>
              Integrated inventory management, dispatch challans, customer ledgers, and multi-role operations.
            </p>

            <div className="space-y-3.5">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-xs font-medium" style={{ color: '#1E293B' }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#DCFCE7' }}>
                    <CheckCircle2 size={13} style={{ color: '#059669' }} />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-8 flex items-center justify-between text-[11px] font-mono border-t text-slate-600" style={{ borderColor: '#BFDBFE' }}>
            <span className="font-medium" style={{ color: '#0369A1' }}>Encrypted Workspace</span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#059669' }}>
              <ShieldCheck size={13} /> Production Ready
            </span>
          </div>
        </div>

        {/* Right panel — login form & demo accounts */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl mb-1" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
                Welcome Back
              </h2>
              <p className="text-xs" style={{ color: '#475569' }}>
                Sign in with your system credentials to access the workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-xl text-xs font-semibold" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#475569' }}>
                  Work Email Address
                </label>
                <input
                  id="email" name="email" type="email"
                  autoComplete="email" required
                  value={form.email} onChange={handleChange}
                  placeholder="name@company.com"
                  className="field-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#475569' }}>
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

              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full py-2.5 text-sm gap-2 font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                {isPending ? 'Authenticating…' : 'Sign In to Workspace'}
                {!isPending && <ArrowRight size={15} />}
              </button>
            </form>

            {/* Quick Demo Role Cards */}
            <div className="mt-7 pt-5" style={{ borderTop: '1px solid #E2E8F0' }}>
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#475569' }}>
                One-Click Quick Login (Demo Roles)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(({ email, password, role, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ email, password })}
                    className="p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between"
                    style={{
                      background: form.email === email ? '#F0F9FF' : '#F8FAFC',
                      borderColor: form.email === email ? '#0284C7' : '#E2E8F0',
                      boxShadow: form.email === email ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (form.email !== email) e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={e => {
                      if (form.email !== email) e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ background: color + '15', color }}
                      >
                        {role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono truncate" style={{ color: '#475569' }}>
                      {email.split('@')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
