'use client';

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import NavHeader from "../components/NavHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72 min-h-screen">
        <NavHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main >
          {children}
        </main>
      </div>
    </>
  );
}
