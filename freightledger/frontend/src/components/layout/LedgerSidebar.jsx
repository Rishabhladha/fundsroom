import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ArrowLeftRight,
  UserCog,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import UserProfileModal from './UserProfileModal';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/customers', icon: Users, label: 'Customers', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/challans', icon: FileText, label: 'Challans', roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/stock-log', icon: ArrowLeftRight, label: 'Stock Log', roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'] },
  { to: '/users', icon: UserCog, label: 'Team & Users', roles: ['ADMIN'] },
];

export default function LedgerSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <>
      <aside
        className="flex flex-col h-full bg-ink-raised border-r border-steel"
        style={{ width: '220px', minWidth: '220px' }}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-steel/60 bg-ink-card/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-crimson to-signal-amber p-0.5 shadow-crimson-glow flex-shrink-0">
              <div className="w-full h-full bg-ink rounded-[7px] flex items-center justify-center font-display font-black text-xs text-crimson">
                FL
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
                FREIGHTLEDGER
              </div>
              <div className="text-[10px] text-crimson font-mono flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                SYSTEM ONLINE
              </div>
            </div>
          </div>
        </div>

        {/* Divider label */}
        <div className="px-5 pt-4 pb-1">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-text/40">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-crimson/15 to-transparent text-crimson border-l-2 border-crimson shadow-sm'
                    : 'text-slate-text/80 hover:bg-steel/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      isActive ? 'text-crimson' : 'text-slate-text/60 group-hover:text-signal-amber'
                    }`}
                  />
                  <span>{label}</span>
                </div>
                {isActive && <Zap size={12} className="text-crimson animate-pulse" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: user profile trigger + logout */}
        <div className="border-t border-steel p-3.5 space-y-2">
          {user && (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2.5 w-full p-2 rounded-md hover:bg-steel/40 transition-colors text-left group"
              title="Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-steel text-signal-amber flex items-center justify-center font-display font-bold text-xs flex-shrink-0 border border-steel group-hover:border-signal-amber/50">
                {user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate flex items-center justify-between">
                  <span>{user.name}</span>
                  <Settings size={12} className="text-slate-text/40 group-hover:text-signal-amber" />
                </div>
                <div className="font-mono text-[10px] text-slate-text/50 truncate">
                  {user.role}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded text-xs text-slate-text/60 hover:text-rust-alert hover:bg-rust-alert/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
