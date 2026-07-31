import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Building2, Briefcase, Flag, FolderTree, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/categories', label: 'Categories & Skills', icon: FolderTree },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-20 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
