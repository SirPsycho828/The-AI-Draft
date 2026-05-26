import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Settings,
  Radio,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/admin/review', label: 'Review Queue', icon: ClipboardCheck },
  { to: '/admin/people', label: 'People', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/collectors', label: 'Collectors', icon: Radio },
];

export function AdminLayout() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 flex gap-8">
      {/* Sidebar — branded with design tokens */}
      <aside className="w-52 shrink-0 hidden md:block">
        <h2 className="font-heading text-2xl tracking-[0.03em] uppercase text-foreground mb-6">
          Admin
        </h2>
        <nav className="flex flex-col gap-0.5">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] font-body text-[0.8125rem] font-500 transition-all duration-[var(--duration-fast)] ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card'
                  }`
                }
              >
                <Icon size={15} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 px-2 py-1 safe-area-pb">
        <div className="flex justify-around">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-[var(--radius-md)] text-[0.625rem] font-600 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </div>
    </div>
  );
}
