import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ArrowLeftRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// LedgerSidebar — reads like a ledger book spine with tabbed dividers.
// Active tab gets a signal-amber left border + slight translation (pulled forward).
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/customers', icon: Users,           label: 'Customers',  roles: ['ADMIN','SALES','ACCOUNTS'] },
  { to: '/products',  icon: Package,         label: 'Products',   roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/challans',  icon: FileText,        label: 'Challans',   roles: ['ADMIN','SALES','WAREHOUSE','ACCOUNTS'] },
  { to: '/stock-log', icon: ArrowLeftRight,  label: 'Stock Log',  roles: ['ADMIN','WAREHOUSE','ACCOUNTS'] },
];

export default function LedgerSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#0E1118',
        borderRight: '1px solid #2B3240',
      }}
    >
      {/* Logo / wordmark */}
      <div
        className="px-5 py-5 border-b border-steel"
        style={{ borderBottomColor: '#2B3240' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-ink font-display font-bold text-sm"
            style={{ backgroundColor: '#F2A93B' }}
          >
            FL
          </div>
          <div>
            <div
              className="font-display font-bold text-sm tracking-wide"
              style={{ color: '#F2A93B', letterSpacing: '0.06em' }}
            >
              FREIGHTLEDGER
            </div>
            <div className="text-xs" style={{ color: '#4A5568', letterSpacing: '0.04em' }}>
              Operations Portal
            </div>
          </div>
        </div>
      </div>

      {/* Divider label — like a ledger section tab */}
      <div className="px-5 pt-5 pb-2">
        <span
          className="font-mono text-xs font-semibold tracking-widest uppercase"
          style={{ color: '#4A5568' }}
        >
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-r-md text-sm font-medium transition-all duration-150 ${
                isActive ? 'sidebar-tab-active' : 'text-slate-text hover:bg-steel/40 hover:text-white'
              }`}
              style={isActive ? { borderLeft: '3px solid #F2A93B', paddingLeft: '10px' } : { borderLeft: '3px solid transparent' }}
            >
              <Icon size={16} className={isActive ? 'text-signal-amber' : 'text-slate-text/60'} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="border-t border-steel p-4" style={{ borderTopColor: '#2B3240' }}>
        {user && (
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar — initials */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: '#2B3240', color: '#F2A93B' }}
            >
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div
                className="font-mono text-xs truncate"
                style={{ color: '#4A5568' }}
              >
                {user.role}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded text-sm transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C4501F';
            e.currentTarget.style.backgroundColor = 'rgba(196,80,31,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
