'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, logout } from '@/app/store/authSlice';
import Sidebar from '../components/Sidebar';
import NavHeader from '../components/NavHeader';
import api from '../lib/axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();

  // Apply persisted dark mode on mount
  useEffect(() => {
    const stored = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', stored);
  }, []);

  // Restore sidebar collapsed state
  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed') === 'true';
    setSidebarCollapsed(stored);
  }, []);

  const handleCollapseToggle = () => {
    setSidebarCollapsed((v) => {
      localStorage.setItem('sidebarCollapsed', String(!v));
      return !v;
    });
  };

  // Load user into Redux on mount
  useEffect(() => {
    api
      .get('/auth/tokenData', { withCredentials: true })
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => dispatch(logout()));
  }, [dispatch]);

  // Re-fetch on profile update events
  useEffect(() => {
    const refresh = () =>
      api
        .get('/auth/tokenData', { withCredentials: true })
        .then((res) => dispatch(setUser(res.data.user)))
        .catch(() => {});
    window.addEventListener('auth:update', refresh);
    return () => window.removeEventListener('auth:update', refresh);
  }, [dispatch]);

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={handleCollapseToggle}
      />
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`}>
        <NavHeader
          onMenuClick={() => setSidebarOpen((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main>{children}</main>
      </div>
    </>
  );
}
