'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, Moon, Sun, Bell, X, MoreVertical, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { logout, setUser } from '@/app/store/authSlice';
import { useLogoutUserMutation } from '@/app/store/authApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface NavHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

// Profile avatar — shows image if available, else initials
function Avatar({ profile, fname, lname, size = 8 }: { profile?: string; fname?: string; lname?: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = `${fname?.charAt(0) ?? ''}${lname?.charAt(0) ?? ''}`.toUpperCase() || 'U';
  const sizeClass = `w-${size} h-${size}`;

  useEffect(() => { setImgError(false); }, [profile]);

  if (profile && !imgError) {
    return (
      <img
        src={`${API_URL}/${profile}`}
        alt={initials}
        className={`${sizeClass} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
    </div>
  );
}

export default function NavHeader({ onMenuClick, sidebarCollapsed }: NavHeaderProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutUser] = useLogoutUserMutation();
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ── Init dark mode from localStorage ──────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    setDarkMode(stored);
    document.documentElement.classList.toggle('dark', stored);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch { /* ignore */ }
    localStorage.removeItem('login');
    dispatch(logout());
    toast.success('Signed out successfully');
    router.replace('/');
  };

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.notif-panel') && !t.closest('.notif-btn')) setShowNotifications(false);
      if (!t.closest('.profile-menu') && !t.closest('.profile-btn')) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: '1', name: 'New Order', action: 'A new order has been placed', time: 'Just now', avatar: 'NO', online: true },
    { id: '2', name: 'Low Stock', action: 'Some products are running low', time: '5 min ago', avatar: 'LS', online: false },
    { id: '3', name: 'Payment', action: 'Payment received successfully', time: '1 hr ago', avatar: 'PM', online: true },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-72'}`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="relative max-w-xs w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile search */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:hidden">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dark mode */}
          <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode
              ? <Sun className="w-5 h-5 text-yellow-400" />
              : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
          </button>

          {/* Notifications */}
          <button onClick={() => setShowNotifications((v) => !v)} className="notif-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile button */}
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="profile-btn flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-2 py-1.5 transition-colors"
          >
            <Avatar profile={user?.profile} fname={user?.fname} lname={user?.lname} size={8} />
            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Hello,</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {user?.fname ? `${user.fname} ${user.lname ?? ''}`.trim() : 'Admin'}
              </span>
            </div>
            <svg className="hidden md:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Notification Panel ── */}
      {showNotifications && (
        <div className="notif-panel absolute right-2 sm:right-6 top-14 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700 last:border-0 cursor-pointer">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {n.avatar}
                  </div>
                  {n.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.action}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <button className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* ── Profile Dropdown ── */}
      {showProfileMenu && (
        <div className="profile-menu absolute right-2 sm:right-6 top-14 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <Avatar profile={user?.profile} fname={user?.fname} lname={user?.lname} size={10} />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {user ? `${user.fname ?? ''} ${user.lname ?? ''}`.trim() : 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {user?.role && (
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium capitalize">
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link href="/cp/edit-profile" onClick={() => setShowProfileMenu(false)}>
              <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Edit Profile</span>
              </div>
            </Link>
            <Link href="/cp/settings" onClick={() => setShowProfileMenu(false)}>
              <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Settings</span>
              </div>
            </Link>

            {/* Dark mode toggle inside menu too */}
            <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={toggleDarkMode}>
              <div className="flex items-center gap-3">
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                <span className="text-sm text-gray-700 dark:text-gray-200">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : ''}`} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 py-1">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
