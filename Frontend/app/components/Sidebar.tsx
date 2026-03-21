'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Bot, 
  ShoppingCart, 
  Calendar, 
  User, 
  CheckSquare, 
  FileText, 
  Table, 
  File, 
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';



interface SubMenuItem {
  label: string
  path: string
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;        
  badge?: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
  isNew?: boolean;
}


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
 const [openMenu, setOpenMenu] = useState<string | null>(null);

  const pathname = usePathname();


  const toggleMenu = (id: string) => {
  setOpenMenu((prev) => (prev === id ? null : id));
};


  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: <LayoutGrid className="w-5 h-5" />,
      hasSubmenu: false
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: <Bot className="w-5 h-5" />,
      isNew: true,
      hasSubmenu: true,
      submenu: [
      { label: "Text Generator", path: "/cp/overview" },
      { label: "Image Generator", path: "/cp/settings" },
      { label: "Code Generator", path: "/cp/users" },
      { label: "Video Generator", path: "/cp/users" },
]

      
    },
    {
      id: 'e-commerce',
      label: 'E-commerce',
      icon: <ShoppingCart className="w-5 h-5" />,
      isNew: true,
      hasSubmenu: false
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'user-profile',
      label: 'User Profile',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'task',
      label: 'Task',
      icon: <CheckSquare className="w-5 h-5" />,
      hasSubmenu: true
    },
  {
  id: 'forms',
  // isNew:false,
  label: 'Forms',
  icon: <FileText className="w-5 h-5" />,
  hasSubmenu: true,
  submenu: [
    { label: "Product", path: "/cp/product" },
    { label: "Category", path: "/cp/category" },
    { label: "Subcategory", path: "/cp/add-subcategory" },
    { label: "Offers", path: "/cp/add-offers" },
  ],
},

{
  id: 'pos',
  label: 'POS',
  icon: <ShoppingCart className="w-5 h-5" />,
  hasSubmenu: true,
  submenu: [
    { label: "Billing", path: "/cp/pos" },
    { label: "Orders", path: "/cp/pos/orders" },
    { label: "Customers", path: "/cp/pos/customers" },
    { label: "Reports", path: "/cp/pos/reports" },
  ],
},


    {
      id: 'tables',
      label: 'Tables',
      icon: <Table className="w-5 h-5" />,
      hasSubmenu: true
    },
    {
      id: 'pages',
      label: 'Pages',
      icon: <File className="w-5 h-5" />,
      hasSubmenu: true
    }
  ];

  const supportItems: MenuItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-5 h-5" />,
      isNew: true,
      hasSubmenu: true
    }
  ];

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  

 const renderMenuItem = (item: MenuItem) => {
    const isOpenMenu = openMenu === item.id;
    const isSubmenuActive = item.submenu?.some(sub => sub.path === pathname);

    const baseClasses = `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
      ${isSubmenuActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
    `;

    const content = (
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
        <span className="font-medium text-sm">{item.label}</span>
        {item.isNew && (
          <span className="px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 rounded">
            NEW
          </span>
        )}
      </div>
    );

    return (
      <div key={item.id} className="mb-1">
        {item.hasSubmenu ? (
          <button onClick={() => toggleMenu(item.id)} className={baseClasses}>
            {content}
            {isOpenMenu ? <ChevronUp className="text-gray-500 dark:text-gray-400"/> : <ChevronDown className="text-gray-500 dark:text-gray-400"/>}
          </button>
        ) : item.path ? (
          <Link href={item.path}>
            <div className={pathname === item.path 
              ? 'bg-blue-50 text-blue-600 dark:bg-[#162042] dark:text-[#7592FF] w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all'
            }>
              {content}
            </div>
          </Link>
        ) : (
          <button className={`${baseClasses} text-gray-700 dark:text-gray-300`}>
            {content}
          </button>
        )}

        {/* Submenu */}
        {item.hasSubmenu && isOpenMenu && item.submenu && (
          <div className="mt-1 ml-8 space-y-1">
            {item.submenu.map(subItem => {
              const isActiveSub = pathname === subItem.path;
              return (
                <Link key={subItem.label} href={subItem.path}>
                  <div className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all
                    ${isActiveSub ? 'bg-blue-100 dark:bg-[#162042]  text-blue-600 dark:text-[#7592FF]' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <span className={`w-2 h-2 rounded-full ${isActiveSub ? 'bg-green-500 dark:bg-green-400' : 'bg-transparent'}`} />
                    {subItem.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6  dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-5 bg-white rounded-full"></div>
                <div className="w-1 h-5 bg-white rounded-full"></div>
                <div className="w-1 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">MajetroDash</span>
          </div>

          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
          <div className="mb-4">
            <p className="px-4 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">MENU</p>
            {menuItems.map(renderMenuItem)}
          </div>

          <div>
            <p className="px-4 mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">SUPPORT</p>
            {supportItems.map(renderMenuItem)}
          </div>
        </div>
      </div>
    </>
  );
}