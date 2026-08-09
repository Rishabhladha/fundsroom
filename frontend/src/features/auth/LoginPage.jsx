import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './useAuth';
import { Boxes, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const [form, setForm] = useState({ email: 'admin@fundsroom.com', password: 'Admin@1234' });
  const [showPassword, setShowPassword] = useState(false);

  const DEMO_ACCOUNTS = [
    {
      name: 'Arjun Mehta',
      email: 'admin@fundsroom.com',
      password: 'Admin@1234',
      role: 'ADMIN',
      badgeBg: '#EEF2FF',
      badgeColor: '#4F46E5',
      desc: 'Full System Control & Settings',
    },
    {
      name: 'Priya Sharma',
      email: 'sales@fundsroom.com',
      password: 'Sales@1234',
      role: 'SALES',
      badgeBg: '#E0F2FE',
      badgeColor: '#0284C7',
      desc: 'Customers, Challans & Follow-ups',
    },
    {
      name: 'Ravi Kulkarni',
      email: 'warehouse@fundsroom.com',
      password: 'Warehouse@1234',
      role: 'WAREHOUSE',
      badgeBg: '#FEF3C7',
      badgeColor: '#D97706',
      desc: 'Inventory & Stock Movements',
    },
    {
      name: 'Deepa Iyer',
      email: 'accounts@fundsroom.com',
      password: 'Accounts@1234',
      role: 'ACCOUNTS',
      badgeBg: '#ECFDF5',
      badgeColor: '#059669',
      desc: 'Payments & Statement of Accounts',
    },
  ];

  function handleSelectAccount(acc) {
    setForm({ email: acc.email, password: acc.password });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(form, { onSuccess: () => navigate('/dashboard') });
  }

  const errorMsg = error?.message || (error ? 'Authentication failed. Check your email or password.' : null);

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6"
      style={{ background: '#F8FAFC', color: '#0F172A', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
          >
            <Boxes size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-wider uppercase" style={{ color: '#0F172A' }}>
              FUNDSROOM
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Operations & ERP Ledger
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>v3.0 Operational</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div
          className="w-full max-w-xl bg-white rounded-2xl p-6 sm:p-8"
          style={{
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(226, 232, 240, 0.6)',
          }}
        >
          {/* Form Header */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Sign In to Workspace
            </h1>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              Enter your corporate credentials below to access FundsRoom
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
              >
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@fundsroom.com"
                  className="w-full py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0F172A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    border: '1.5px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0F172A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 mt-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                opacity: isPending ? 0.75 : 1,
              }}
            >
              {isPending ? 'Authenticating…' : 'Sign In to FundsRoom'}
              {!isPending && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Downside: Multi-User Quick Auto-fill Section */}
          <div className="mt-7 pt-6" style={{ borderTop: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Multi-User Auto-Fill (Click to Select)
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-medium">
                4 Demo Roles Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = form.email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className="p-3 rounded-xl text-left transition-all border relative cursor-pointer"
                    style={{
                      background: isSelected ? '#F0F9FF' : '#F8FAFC',
                      borderColor: isSelected ? '#0284C7' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.15)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono"
                        style={{ background: acc.badgeBg, color: acc.badgeColor }}
                      >
                        {acc.role}
                      </span>
                      {isSelected && (
                        <CheckCircle2 size={13} className="text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: '#0F172A' }}>
                      {acc.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {acc.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center py-2 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>256-Bit TLS Encrypted Session</span>
        <span>•</span>
        <span>FundsRoom Operations Portal</span>
      </footer>
    </div>
  );
}