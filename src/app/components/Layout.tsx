import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  UserCog,
  Settings,
  Menu,
  X,
  HeartPulse,
  LogOut,
  Bell,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { IdleSplashScreen } from './IdleSplashScreen';
import { SubscriptionBanner } from './SubscriptionBanner';
import { useHospitalSettings } from '../context/HospitalSettingsContext';
import { canAccess } from '../roleAccess';
import { notificationApi, AppNotification } from '../services/api';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Doctors', href: '/doctors', icon: Stethoscope },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Medical Records', href: '/records', icon: FileText },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Staff', href: '/staff', icon: UserCog },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: { name: string; href: string; icon: React.ElementType };
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      <span>{item.name}</span>
    </Link>
  );
}

/**
 * Notification Bell — opens a small preview panel.
 * Clicking "View all & manage" navigates to Settings → Notifications tab.
 */
function NotificationBell({ onNav }: { onNav?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread count every 30 s when there is a logged-in user
  useEffect(() => {
    if (!user?.id) return;
    const load = () => {
      notificationApi.getForUser(user.id).then((list) => {
        setNotifications(list.slice(0, 10));
        setUnreadCount(list.filter((n) => !n.read).length);
      }).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await notificationApi.markAllRead(user.id).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const goToNotificationSettings = () => {
    setOpen(false);
    onNav?.();
    navigate('/settings?tab=notifications');
  };

  return (
    <div className="relative">
      <button
        type="button"
        title="Notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-semibold text-gray-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-3 ${n.read ? 'opacity-60' : 'bg-blue-50/40'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 truncate ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as read"
                      className="shrink-0 w-2 h-2 mt-1 rounded-full bg-blue-500 hover:bg-blue-700"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer — links to Settings → Notifications */}
          <div className="border-t px-4 py-2">
            <button
              onClick={goToNotificationSettings}
              className="w-full text-center text-xs text-blue-600 hover:underline py-1"
            >
              View all &amp; manage notification settings →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarFooter({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AU';

  return (
    <div className="px-4 pb-4 border-t pt-4">
      <NavLink
        item={{ name: 'Settings', href: '/settings', icon: Settings }}
        active={pathname === '/settings'}
        onClick={onNav}
      />
      <div className="mt-3 px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-blue-700">{initials}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const { settings } = useHospitalSettings();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isIdle, wakeUp } = useIdleTimer(settings.security.autoLogout ? 30 * 60 * 1000 : 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <IdleSplashScreen visible={isIdle} onDismiss={wakeUp} />
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center justify-between gap-2">
              <HeartPulse className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-blue-600">AfyaCare MS</h1>
              <NotificationBell onNav={() => setSidebarOpen(false)} />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 mt-6 px-4 overflow-y-auto">
            {navigation.filter((item) => canAccess(user?.role, item.href)).map((item) => (
              <NavLink
                key={item.name}
                item={item}
                active={location.pathname === item.href}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
          <SidebarFooter pathname={location.pathname} onNav={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-6 py-6 border-b">
            <div className="flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-blue-600">AfyaCare MS</h1>
            </div>
            <NotificationBell />
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navigation.filter((item) => canAccess(user?.role, item.href)).map((item) => (
              <NavLink
                key={item.name}
                item={item}
                active={location.pathname === item.href}
              />
            ))}
          </nav>
          <SidebarFooter pathname={location.pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-between gap-2">
            <HeartPulse className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-blue-600">AfyaCare MS</h1>
            <NotificationBell onNav={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Subscription / trial banner */}
        <SubscriptionBanner />

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <HeartPulse className="w-4 h-4 text-blue-500" />
              <span>
                &copy; {new Date().getFullYear()} {settings.hospitalName}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Version 2.4.1</span>
              <span className="hidden sm:inline text-gray-200">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors hidden sm:inline">
                Privacy Policy
              </a>
              <span className="hidden sm:inline text-gray-200">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors hidden sm:inline">
                Terms of Use
              </a>
              <span className="hidden sm:inline text-gray-200">|</span>
              <a href="#" className="hover:text-blue-600 transition-colors hidden sm:inline">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
