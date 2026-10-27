import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Sparkles, Moon, Sun } from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { appSettings, toggleGlobalTheme } = useHospitalData();
  const isDark = appSettings.themeMode === 'dark';

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] flex text-[#334155] dark:text-[#F1F5F9] transition-colors">
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
        <div className="bg-blue-50/70 dark:bg-slate-800/80 border-b border-blue-100 dark:border-slate-700 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs text-[#1E3A5F] dark:text-[#F1F5F9] no-print transition-colors">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
            <span className="font-semibold">MediCare Plus System Active:</span>
            <span className="hidden sm:inline text-[#64748B] dark:text-[#CBD5E1]">
              In-memory mock data active. Add, edit, status changes, and searches are fully interactive.
            </span>
          </div>
          <button
            onClick={toggleGlobalTheme}
            className="text-[11px] font-medium text-[#0F766E] dark:text-[#4ADE80] shrink-0 flex items-center gap-1.5 hover:underline cursor-pointer"
            title="Click to toggle hospital global theme"
          >
            {isDark ? <Moon className="w-3 h-3 text-[#60A5FA]" /> : <Sun className="w-3 h-3 text-amber-500" />}
            Hospital Theme: {isDark ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
