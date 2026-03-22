'use client';

import React, { useState } from 'react';
import {
  LayoutGrid, ShoppingCart, User, ChevronDown, ChevronUp, X, Tag,
  Users, BarChart2, Settings, Package, Layers, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubMenuItem { label: string; path: string; }
interface MenuItem {
  id: string; label: string; icon: React.ReactNode;
  path?: string; hasSubmenu?: boolean; submenu?: SubMenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onCollapseToggle }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [popout, setPopout] = useState<string | null>(null);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/cp/dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    {
      id: 'pos', label: 'POS', icon: <ShoppingCart className="w-5 h-5" />, hasSubmenu: true,
      submenu: [
        { label: 'Billing', path: '/cp/pos' },
        { label: 'Orders', path: '/cp/pos/orders' },
        { label: 'Customers', path: '/cp/pos/customers' },
        { label: 'Reports', path: '/cp/pos/reports' },
        { label: 'Discounts', path: '/cp/pos/discounts' },
      ],
    },
    {
      id: 'catalog', label: 'Catalog', icon: <Package className="w-5 h-5" />, hasSubmenu: true,
      submenu: [
        { label: 'Products', path: '/cp/product' },
        { label: 'Add Product', path: '/cp/add-product' },
        { label: 'Categories', path: '/cp/category' },
      ],
    },
    { id: 'customers-top', label: 'Customers', path: '/cp/pos/customers', icon: <Users className="w-5 h-5" /> },
    { id: 'reports-top', label: 'Reports', path: '/cp/pos/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'discounts-top', label: 'Discounts', path: '/cp/pos/discounts', icon: <Tag className="w-5 h-5" /> },
  ];

  const bottomItems: MenuItem[] = [
    { id: 'profile', label: 'Edit Profile', path: '/cp/edit-profile', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', path: '/cp/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isItemActive = (item: MenuItem) => {
    if (item.path) return pathname === item.path || pathname.startsWith(item.path + '/');
    return item.submenu?.some((s) => pathname === s.path || pathname.startsWith(s.path + '/')) ?? false;
  };

  // ── Mini (icon-only) item ─────────────────────────────────────────────────
  const renderMiniItem = (item: MenuItem) => {
    const active = isItemActive(item);
    const iconBtn = `w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
      active
        ? 'bg-blue-50 dark:bg-[#162042] text-blue-600 dark:text-[#7592FF]'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

    if (item.hasSubmenu && item.submenu) {
      return (
        <div
          key={item.id}
          className="relative flex justify-center"
          onMouseEnter={() => setPopout(item.id)}
          onMouseLeave={() => setPopout(null)}
        >
          <button title={item.label} className={iconBtn}>{item.icon}</button>

          {popout === item.id && (
            <div className="absolute left-12 top-0 z-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 w-44 min-w-max">
              <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              {item.submenu.map((sub) => {
                const subActive = pathname === sub.path;
                return (
                  <Link key={sub.label} href={sub.path} onClick={onClose}>
                    <div className={`px-3 py-2 text-sm transition-colors ${
                      subActive
                        ? 'text-blue-600 dark:text-[#7592FF] bg-blue-50 dark:bg-[#162042] font-medium'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                      {sub.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.id} className="flex justify-center">
        <Link href={item.path!} onClick={onClose} title={item.label}>
          <div className={iconBtn}>{item.icon}</div>
        </Link>
      </div>
    );
  };

  // ── Full-width item ───────────────────────────────────────────────────────
  const renderFullItem = (item: MenuItem) => {
    const isOpenMenu = openMenu === item.id;
    const active = isItemActive(item);
    const base = 'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium';
    const activeClass = 'bg-blue-50 text-blue-600 dark:bg-[#162042] dark:text-[#7592FF]';
    const inactiveClass = 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';

    const content = (
      <div className="flex items-center gap-3">
        <span className={active ? 'text-blue-600 dark:text-[#7592FF]' : 'text-gray-500 dark:text-gray-400'}>
          {item.icon}
        </span>
        <span>{item.label}</span>
      </div>
    );

    return (
      <div key={item.id} className="mb-0.5">
        {item.hasSubmenu ? (
          <button
            onClick={() => setOpenMenu((p) => (p === item.id ? null : item.id))}
            className={`${base} ${active ? activeClass : inactiveClass}`}
          >
            {content}
            {isOpenMenu
              ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
          </button>
        ) : item.path ? (
          <Link href={item.path} onClick={onClose}>
            <div className={`${base} ${active ? activeClass : inactiveClass}`}>{content}</div>
          </Link>
        ) : (
          <button className={`${base} ${inactiveClass}`}>{content}</button>
        )}

        {item.hasSubmenu && isOpenMenu && item.submenu && (
          <div className="mt-0.5 ml-4 space-y-0.5">
            {item.submenu.map((sub) => {
              const subActive = pathname === sub.path;
              return (
                <Link key={sub.label} href={sub.path} onClick={onClose}>
                  <div className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-all ${
                    subActive
                      ? 'bg-blue-100 dark:bg-[#162042] text-blue-600 dark:text-[#7592FF] font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    {sub.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Sidebar panel */}
      <div className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
      `}>

        {/* Logo */}
        <div className={`p-4 flex items-center border-b border-gray-100 dark:border-gray-800 ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Layers size={18} className="text-white" />
            </div>
            <span className={`text-lg font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
              MajetroDash
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-3">
          {isCollapsed ? (
            /* ─ Mini mode ─ */
            <div className="hidden lg:flex flex-col gap-1">
              {[...menuItems, ...bottomItems].map(renderMiniItem)}
            </div>
          ) : null}

          {/* Always render full items on mobile; on desktop only when not collapsed */}
          <div className={isCollapsed ? 'lg:hidden' : ''}>
            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">MAIN</p>
            <div className="space-y-0.5 mb-5">{menuItems.map(renderFullItem)}</div>
            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">ACCOUNT</p>
            <div className="space-y-0.5">{bottomItems.map(renderFullItem)}</div>
          </div>
        </div>

        {/* Footer / collapse button */}
        <div className={`p-3 border-t border-gray-100 dark:border-gray-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="bg-blue-50 dark:bg-[#162042] rounded-xl px-3 py-2.5 flex items-center gap-3 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingCart size={13} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">POS System</p>
                <p className="text-xs text-blue-500 truncate">Ready for orders</p>
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={onCollapseToggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            {isCollapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={15} /><span>Collapse</span></>}
          </button>
        </div>
      </div>
    </>
  );
}
