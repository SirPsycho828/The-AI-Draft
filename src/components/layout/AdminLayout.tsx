import { NavLink, Outlet } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/review', label: 'Review Queue' },
  { to: '/admin/people', label: 'People' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/collectors', label: 'Collectors' },
];

export function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <aside className="w-56 shrink-0">
        <h2 className="text-lg font-semibold mb-4">Admin</h2>
        <nav className="flex flex-col gap-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
