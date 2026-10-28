import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Hospital,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHospitalData } from '../context/HospitalDataContext';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/patients': 'Patient Management',
  '/doctors': 'Doctor Directory',
  '/departments': 'Clinical Departments',
  '/appointments': 'Appointment Scheduling',
  '/admissions': 'Inpatient Admissions & Beds',
  '/billing': 'Invoicing & Revenue',
  '/pharmacy': 'Pharmacy & Stock Inventory',
  '/staff': 'Hospital Staff & Roles',
  '/reports': 'Analytics & Clinical Reports',
  '/settings': 'System Settings & Preferences',
};

export const Topbar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hospitalProfile, appSettings, toggleGlobalTheme } = useHospitalData();
  const isDark = appSettings?.themeMode === 'dark';
  const userRole = (user?.role || '').toUpperCase();
  const isAdmin =
    !user ||
    userRole === 'ADMIN' ||
    userRole === 'HOSPITAL ADMINISTRATOR' ||
    userRole === 'SUPERADMIN';

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const currentTitle = PAGE_TITLES[location.pathname] || 'MediCare Plus';

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/patients?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const notifications = [
    {
      id: 1,
      title: 'Emergency Admission',
      time: '15 mins ago',
      desc: 'Patient Chandrasiri Jayawardena admitted to CCU-02.',
      type: 'critical',
    },
    {
      id: 2,
      title: 'Low Pharmacy Stock',
      time: '1 hour ago',
      desc: 'Salbutamol Inhaler and Paracetamol IV below threshold.',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Daily Surgery Schedule',
      time: '3 hours ago',
      desc: '4 surgical cases scheduled in Operating Theater B.',
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -ml-2 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] hover:bg-[#F7F9FC] dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1] font-medium">
            <Link to="/" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
              MediCare Plus
            </Link>
            <span>/</span>
            <span className="text-[#1E3A5F] dark:text-[#F1F5F9] font-semibold truncate">{currentTitle}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-[#1E3A5F] dark:text-[#F1F5F9] truncate tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, medical records, or MRN..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F7F9FC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-[#334155] rounded-lg placeholder:text-[#64748B] dark:placeholder:text-slate-400 text-[#334155] dark:text-[#F1F5F9] focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA] transition-colors"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications, Hospital Badge, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Hospital Branch Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] text-xs font-medium text-[#334155] dark:text-[#CBD5E1]">
          <Hospital className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#4ADE80]" />
          <span className="truncate max-w-[150px]">{hospitalProfile?.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#4ADE80]" title="Online & Operational" />
        </div>

        {/* Global Theme Switcher (Authorized Admin Only) */}
        {isAdmin && (
          <button
            onClick={toggleGlobalTheme}
            className="p-2 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-[#F7F9FC] dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isDark ? 'Switch Hospital Theme to Light Mode' : 'Switch Hospital Theme to Dark Mode'}
            aria-label="Toggle hospital global theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#64748B]" />
            )}
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#1E3A5F] dark:hover:text-[#F1F5F9] hover:bg-[#F7F9FC] dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B91C1C] dark:bg-[#F87171] ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-lg py-2 z-50">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                <span className="text-sm font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">Hospital Notifications</span>
                <span className="text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155] max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-[#F7F9FC] dark:hover:bg-slate-700/50 transition-colors flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'critical' ? (
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#B91C1C] dark:text-[#F87171] flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : item.type === 'warning' ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{item.title}</p>
                        <span className="text-[10px] text-[#64748B] dark:text-[#CBD5E1]">{item.time}</span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-[#E2E8F0] dark:border-[#334155] text-center">
                <Link
                  to="/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                >
                  View Activity Logs & Reports
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F9FC] dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#2563EB] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'MP'}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#F1F5F9] leading-none">{user?.name}</p>
              <p className="text-[10px] font-medium text-[#64748B] dark:text-[#CBD5E1] mt-0.5">{user?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                <p className="text-xs font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">{user?.name}</p>
                <p className="text-[11px] text-[#64748B] dark:text-[#CBD5E1] truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-[#4ADE80] text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified {user?.role || 'Staff'}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F7F9FC] dark:hover:bg-slate-700/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA]"
                >
                  <User className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1]" />
                  My Admin Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F7F9FC] dark:hover:bg-slate-700/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA]"
                >
                  <Settings className="w-4 h-4 text-[#64748B] dark:text-[#CBD5E1]" />
                  Hospital Settings
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => {
                      toggleGlobalTheme();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F7F9FC] dark:hover:bg-slate-700/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA] cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
                      Hospital Theme
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[#334155] dark:text-[#F1F5F9]">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>
                )}
              </div>

              <div className="border-t border-[#E2E8F0] dark:border-[#334155] pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
