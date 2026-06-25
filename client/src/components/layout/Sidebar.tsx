import {
  Bot,
  Gauge,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/wallets', label: 'Wallets', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/budgets', label: 'Budgets', icon: Gauge },
  { to: '/advisor', label: 'Advisor', icon: Bot },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-sidebar flex-col border-r border-line bg-surface">
      <div className="px-5 py-5">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3"
          aria-label="Akiba — home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-card-sm bg-primary text-white shadow-token-sm">
            <PiggyBank size={20} strokeWidth={2.2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-ink">Akiba</span>
            <span className="text-[11px] uppercase tracking-wider text-ink-3">
              Finance tracker
            </span>
          </span>
        </NavLink>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
        <p className="eyebrow px-3 pb-2">Main</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-card-sm px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-soft text-primary'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
              )
            }
          >
            <item.icon size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4 text-xs text-ink-3">
        <p>Akiba Finance Tracker</p>
      </div>
    </aside>
  );
}
