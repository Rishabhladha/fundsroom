import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, FileText,
  ArrowLeftRight, UserCog, LogOut, Settings, Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import UserProfileModal from './UserProfileModal';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/customers',  icon: Users,            label: 'Customers',   roles: ['ADMIN','SALES','ACCOUNTS'] },
  { to: '/products',   icon: Package,          label: 'Products',    roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/challans',   icon: FileText,         label: 'Challans',    roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/stock-log',  icon: ArrowLeftRight,   label: 'Stock Log',   roles: ['ADMIN','WAREHOUSE','ACCOUNTS'] },
  { to: '/users',      icon: UserCog,          label: 'Team',        roles: ['ADMIN'] },
];

export default function LedgerSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <>
      <aside
        className="flex flex-col h-full nav-scroll overflow-y-auto"
        style={{
          width: '228px',
          minWidth: '228px',
          background: 'var(--navy)',
          borderRight: '1px solid var(--navy-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: '1px solid var(--navy-border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
            style={{ background: 'var(--violet)', boxShadow: '0 0 0 4px rgba(108,99,255,0.2)' }}
          >
            <Zap size={14} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-widest text-white" style={{ letterSpacing: '0.1em' }}>
              FREIGHTLEDGER
            </div>
            <div className="text-[10px] font-mono" style={{ color: '#4A6A8A' }}>
              Operations Portal
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#2C4A6A' }}>
            Workspace
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1">
          {visibleItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="nav-icon" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile */}
        <div style={{ borderTop: '1px solid var(--navy-border)' }} className="p-3">
          {user && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors group"
              style={{ ':hover': { background: 'rgba(255,255,255,0.05)' } }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #4F46E5)' }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] font-mono truncate" style={{ color: '#4A6A8A' }}>{user.role}</div>
              </div>
              <Settings size={12} style={{ color: '#2C4A6A' }} />
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-xs transition-colors"
            style={{ color: '#4A6A8A' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#4A6A8A'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
