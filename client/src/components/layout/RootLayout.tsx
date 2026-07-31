import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, Bell, Building2, LayoutDashboard, LogOut, Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { connectSocket, disconnectSocket, onNotification } from '@/lib/socket';
import api from '@/lib/api';
import type { Notification } from '@/types';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/misc';

export default function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      connectSocket(user.id);
      const unsub = onNotification((n) => {
        setNotifications((prev) => [n, ...prev].slice(0, 30));
        setUnread((u) => u + 1);
      });
      api.get('/notifications', { params: { pageSize: 30 } }).then((res) => {
        setNotifications(res.data.notifications);
        setUnread(res.data.unread);
      });
      return () => {
        unsub();
        disconnectSocket();
      };
    }
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id: string, link?: string | null) => {
    await api.put(`/notifications/${id}/read`);
    setUnread((u) => Math.max(0, u - 1));
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (link) navigate(link);
    setBellOpen(false);
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const links = user
    ? user.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/jobs', label: 'Browse Jobs', icon: Search },
        ]
      : user.role === 'EMPLOYER'
      ? [
          { to: '/employer', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
          { to: '/employer/company', label: 'Company', icon: Building2 },
        ]
      : [
          { to: '/jobs', label: 'Browse Jobs', icon: Search },
          { to: '/applications', label: 'Applications', icon: Briefcase },
          { to: '/saved', label: 'Saved Jobs', icon: Building2 },
          { to: '/profile', label: 'My Profile', icon: User },
        ]
    : [];

  const dashboardLink =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'EMPLOYER' ? '/employer' : '/jobs';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Hire<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === dashboardLink}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={() => setBellOpen((o) => !o)}
                    className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAll} className="text-xs text-indigo-600 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 && (
                          <p className="px-2 py-6 text-center text-sm text-slate-400">No notifications yet</p>
                        )}
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markRead(n.id, n.link)}
                            className={`w-full rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                              n.read ? 'opacity-70' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                                <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link to={dashboardLink} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100">
                  <Avatar>{`${user.firstName[0]}${user.lastName[0]}`}</Avatar>
                  <span className="hidden text-sm font-medium text-slate-700 md:block">
                    {user.firstName}
                  </span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
            <button
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                  }`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold">HireConnect</span>
            </div>
            <p className="text-sm text-slate-500">Connecting talent with opportunity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
