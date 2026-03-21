'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, Moon, Sun, Bell, X, MoreVertical, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import api from '../lib/axios';
import useAuth from '../cp/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface Notification {
  id: string;
  name: string;
  action: string;
  project: string;
  category: string;
  time: string;
  avatar: string;
  online: boolean;
}

interface UserPayload {
  email: string;
  profile?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  address?: string;
}

interface NavHeaderProps {
  onMenuClick: () => void;
}

export default function NavHeader({ onMenuClick }: NavHeaderProps) {
  const apibase = process.env.NEXT_PUBLIC_API_URL
   const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter()

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }

  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
    }
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

const logout = async () => {
  try {
    await api.post("/auth/logout", {}, { withCredentials: true });
    localStorage.removeItem("login");

    // Dispatch a global logout event
    window.dispatchEvent(new Event("logout"));

    toast.success("Signed out successfully");
    router.replace("/");
  } catch (error) {
    toast.error("Logout failed. Try again.");
  }
};


const closeProfileMenu = () => {
  setShowProfileMenu(false);
};


  
  const notifications: Notification[] = [
    {
      id: '1',
      name: 'Alena Franci',
      action: 'requests permission to change',
      project: 'Project - Nganter App',
      category: 'Project',
      time: '8 min ago',
      avatar: 'AF',
      online: true
    },
    {
      id: '2',
      name: 'Jocelyn Kenter',
      action: 'requests permission to change',
      project: 'Project - Nganter App',
      category: 'Project',
      time: '15 min ago',
      avatar: 'JK',
      online: true
    },
    {
      id: '3',
      name: 'Brandon Philips',
      action: 'requests permission to change',
      project: 'Project - Nganter App',
      category: 'Project',
      time: '1 hr ago',
      avatar: 'BP',
      online: false
    },
    {
      id: '4',
      name: 'Terry Franci',
      action: 'requests permission to change',
      project: 'Project - Nganter App',
      category: 'Project',
      time: '5 min ago',
      avatar: 'TF',
      online: true
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-panel') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 lg:left-72 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Left Section - Menu and Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search or type command..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-100 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Right Section - Theme, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors sm:hidden">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="notification-button p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="profile-button flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 sm:px-3 py-2 transition-colors relative"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
              <img src={`${apibase}/${user?.profile}`} alt="No Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="hidden md:block font-medium text-gray-700 dark:text-gray-200 text-sm">Hello,{user?.fname}</span>
            <svg className="hidden md:block w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="notification-panel absolute right-2 sm:right-6 top-16 sm:top-20 w-[calc(100vw-1rem)] sm:w-96 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                    {notification.avatar}
                  </div>
                  {notification.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold">{notification.name}</span>
                    {' '}
                    <span className="text-gray-600 dark:text-gray-400">{notification.action}</span>
                    {' '}
                    <span className="font-semibold">{notification.project}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.category}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                  </div>
                </div>
                
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0">
                  <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
              View All Notification
            </button>
          </div>
        </div>
      )}

      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <div className="profile-menu absolute right-2 sm:right-6 top-16 sm:top-20 w-[calc(100vw-1rem)] sm:w-72 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{user?.fname + " " + user?.lname}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
          
          <div className="py-2">
            <Link href="/cp/edit-profile" onClick={closeProfileMenu}>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Edit profile</span>
            </button>
            </Link>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Account settings</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Support</span>
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}