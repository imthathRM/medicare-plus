import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Sparkles } from 'lucide-react';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        {/* Development Banner (subtle, professional) */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs text-[#1E3A5F] no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="font-semibold">MediCare Plus System Active:</span>
            <span className="hidden sm:inline text-[#64748B]">
              In-memory mock data active. Add, edit, status changes, and searches are fully interactive.
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#0F766E] shrink-0">
            Light Healthcare Theme
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
