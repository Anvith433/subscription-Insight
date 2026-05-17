import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingAPI, recommendationAPI, usageAPI } from '../services/api';
import {
  TrendingUp,
  LayoutDashboard,
  CreditCard,
  BarChart2,
  Calendar,
  Upload,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/calendar', label: 'Payment Calendar', icon: Calendar },
  { to: '/upload', label: 'CSV Upload', icon: Upload },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const notificationStorageKey = useMemo(
    () => `notification-read:${user?.email || user?.userName || 'guest'}`,
    [user?.email, user?.userName]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(notificationStorageKey);
      if (!raw) {
        setReadNotificationIds([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setReadNotificationIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [notificationStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(notificationStorageKey, JSON.stringify(readNotificationIds));
    } catch {
      // Ignore storage quota errors and continue with in-memory state.
    }
  }, [notificationStorageKey, readNotificationIds]);

  useEffect(() => {
    let cancelled = false;

    const formatRelativeDate = (dateValue) => {
      if (!dateValue) return 'Date unavailable';
      const due = new Date(dateValue);
      if (Number.isNaN(due.getTime())) return 'Date unavailable';

      const now = new Date();
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays > 1) return `Due in ${diffDays} days`;
      return `${Math.abs(diffDays)} days ago`;
    };

    const loadNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const [upcomingRes, recsRes, usageRes] = await Promise.all([
          billingAPI.getUpcoming(),
          recommendationAPI.getAll(),
          usageAPI.getMonthly(),
        ]);

        if (cancelled) return;

        const upcoming = (upcomingRes.data || []).slice(0, 3).map((b) => ({
          id: `bill-${b.id}`,
          level: 'warn',
          title: `${b.providerName || 'Subscription'} payment due`,
          subtitle: `${formatRelativeDate(b.paidAt)} • $${Number(b.amount || 0).toFixed(2)}`,
          to: '/calendar',
        }));

        const recs = (recsRes.data || [])
          .filter((r) => r.type === 'CANCEL' || r.type === 'DOWNGRADE')
          .slice(0, 2)
          .map((r) => ({
            id: `rec-${r.id}`,
            level: 'info',
            title: `${r.providerName || 'Subscription'} can be optimized`,
            subtitle: `Potential savings: $${Number(r.potentialSavings || 0).toFixed(2)}/mo`,
            to: '/dashboard',
          }));

        const usage = usageRes.data || [];
        const totalMinutes = usage.reduce((sum, u) => sum + Number(u.totalMinutes || 0), 0);
        const usageCard = {
          id: 'usage-sync',
          level: 'success',
          title: totalMinutes > 0 ? 'Usage synced successfully' : 'No usage synced yet',
          subtitle:
            totalMinutes > 0
              ? `${usage.length} service(s), ${totalMinutes} min this month`
              : 'Keep browsing tracked sites to generate usage data',
          to: '/analytics',
        };

        const nextItems = [...upcoming, ...recs, usageCard].slice(0, 6);
        setNotificationItems(nextItems);
        setReadNotificationIds((prev) => prev.filter((id) => nextItems.some((item) => item.id === id)));
      } catch {
        if (!cancelled) {
          setNotificationItems([
            {
              id: 'notif-error',
              level: 'warn',
              title: 'Notifications unavailable',
              subtitle: 'Unable to load alerts right now',
              to: '/dashboard',
            },
          ]);
          setReadNotificationIds([]);
        }
      } finally {
        if (!cancelled) setLoadingNotifications(false);
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const unreadCount = useMemo(
    () => notificationItems.filter((item) => !readNotificationIds.includes(item.id)).length,
    [notificationItems, readNotificationIds]
  );

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notificationItems.map((item) => item.id));
  };

  const openNotification = (item) => {
    setReadNotificationIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    setNotificationOpen(false);
    if (item.to) {
      navigate(item.to);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarNavigate = (to) => {
    setAvatarMenuOpen(false);
    navigate(to);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Smart Sub</p>
          <p className="text-slate-400 text-xs">Analyzer</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-slate-700/50 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-700/30 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(user?.username || user?.userName || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{user?.username || user?.userName || 'User'}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-800/50 border-r border-slate-700/50 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-60 bg-slate-800 border-r border-slate-700/50 flex flex-col z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
          <button
            className="lg:hidden text-slate-400 hover:text-white transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto relative">
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen((prev) => !prev);
                  setAvatarMenuOpen(false);
                }}
                className="relative p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700/50"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-500 text-[10px] leading-4 text-white text-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700/70 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <div className="flex items-center gap-3">
                      {notificationItems.length > 0 && unreadCount > 0 && (
                        <button
                          className="text-xs text-blue-400 hover:text-blue-300"
                          onClick={markAllNotificationsRead}
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        className="text-xs text-slate-400 hover:text-white"
                        onClick={() => setNotificationOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-6 text-sm text-slate-400">Loading alerts...</div>
                    ) : notificationItems.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-slate-400">No alerts right now.</div>
                    ) : (
                      notificationItems.map((item) => (
                        <button
                          key={item.id}
                          className={`w-full text-left px-4 py-3 border-b border-slate-700/50 last:border-b-0 transition ${
                            readNotificationIds.includes(item.id)
                              ? 'bg-slate-800 hover:bg-slate-700/30'
                              : 'bg-slate-700/20 hover:bg-slate-700/40'
                          }`}
                          onClick={() => openNotification(item)}
                        >
                          <p className="text-sm text-white">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.subtitle}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                aria-label="Open profile menu"
                onClick={() => {
                  setAvatarMenuOpen((prev) => !prev);
                  setNotificationOpen(false);
                }}
              >
                {(user?.username || user?.userName || 'U')[0].toUpperCase()}
              </button>

              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700/70">
                    <p className="text-sm text-white font-semibold truncate">{user?.username || user?.userName || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-200 hover:bg-slate-700/60"
                      onClick={() => handleAvatarNavigate('/dashboard')}
                    >
                      Profile Overview
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-200 hover:bg-slate-700/60"
                      onClick={() => handleAvatarNavigate('/analytics')}
                    >
                      Usage Settings
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-300 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
