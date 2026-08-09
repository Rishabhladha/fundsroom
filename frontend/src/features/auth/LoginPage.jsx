import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from './useAuth';
import { Boxes, ArrowRight, Lock, Mail, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const [form, setForm] = useState({ email: 'admin@fundsroom.com', password: 'Admin@1234' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('ADMIN');

  const DEMO_ROLES = [
    { role: 'ADMIN', label: 'Admin', email: 'admin@fundsroom.com', pass: 'Admin@1234' },
    { role: 'SALES', label: 'Sales', email: 'sales@fundsroom.com', pass: 'Sales@1234' },
    { role: 'WAREHOUSE', label: 'Warehouse', email: 'warehouse@fundsroom.com', pass: 'Warehouse@1234' },
    { role: 'ACCOUNTS', label: 'Accounts', email: 'accounts@fundsroom.com', pass: 'Accounts@1234' },
  ];

  function handleRoleSelect(item) {
    setActiveRole(item.role);
    setForm({ email: item.email, password: item.pass });
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(form, { onSuccess: () => navigate('/dashboard') });
  }

  const errorMsg = error?.message || (error ? 'Login failed. Please verify your credentials.' : null);

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-6 select-none"
      style={{
        background: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Navigation Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{
              background: '#2563EB',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Boxes size={16} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-wider uppercase" style={{ color: '#0F172A' }}>
              FUNDSROOM
            </span>
            <span className="text-xs font-mono ml-2 px-2 py-0.5 rounded font-medium" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              v3.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: '#64748B' }}>
          <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: '#10B981' }} />
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div
          className="w-full max-w-md bg-white rounded-2xl p-8 transition-all"
          style={{
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          }}
        >
          {/* Card Header */}
          <div className="mb-6 text-center">
            <h1 className="font-display font-bold text-2xl" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Welcome to FundsRoom
            </h1>
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
              Sign in to manage inventory, dispatches, and customer ledgers
            </p>
          </div>

          {/* Segmented Quick Demo Selector */}
          <div className="mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center justify-between" style={{ color: '#64748B' }}>
              <span>Quick Demo Account</span>
              <span className="text-[10px] text-blue-600 font-mono font-medium">Click role to auto-fill</span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
              {DEMO_ROLES.map((item) => {
                const isActive = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSelect(item)}
                    className="py-1.5 rounded-lg text-xs font-semibold transition-all text-center"
                    style={
                      isActive
                        ? { background: '#FFFFFF', color: '#2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                        : { color: '#64748B' }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
              >
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#475569' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@fundsroom.com"
                  className="w-full py-2.5 rounded-xl text-sm outline-none transition-all font-sans"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '14px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#475569' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full py-2.5 rounded-xl text-sm outline-none transition-all font-sans"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '38px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
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
              {isPending ? 'Signing in…' : 'Sign In to Workspace'}
              {!isPending && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Key Features Badges */}
          <div className="mt-6 pt-5 grid grid-cols-2 gap-2 text-[11px] font-medium" style={{ borderTop: '1px solid #F1F5F9', color: '#475569' }}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Real-time Inventory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Dispatch Challans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Customer Ledgers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Role Access Control</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Security Badge */}
      <footer className="max-w-5xl mx-auto w-full text-center py-2 text-[11px] font-mono flex items-center justify-center gap-2" style={{ color: '#94A3B8' }}>
        <Shield size={12} className="text-emerald-600" />
        <span>256-Bit SSL Encrypted Session</span>
        <span>•</span>
        <span>FundsRoom Operations Portal</span>
      </footer>
    </div>
  );
}