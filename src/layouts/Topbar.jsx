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
  const { hospitalProfile } = useHospitalData();

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
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-sky-600 transition-colors">
              MediCare Plus
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{currentTitle}</span>
          </nav>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, medical records, or MRN..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions, Notifications, Hospital Badge, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Hospital Branch Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-700">
          <Hospital className="w-3.5 h-3.5 text-sky-600" />
          <span className="truncate max-w-[150px]">{hospitalProfile?.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online & Operational" />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Hospital Notifications</span>
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'critical' ? (
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : item.type === 'warning' ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <Link
                  to="/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
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
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                : 'MP'}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{user?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Hospital Admin
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Admin Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Hospital Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
