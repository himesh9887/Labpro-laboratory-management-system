import { useEffect, useRef, useState } from 'react';
import { FiBell, FiChevronDown, FiMenu, FiMoon, FiSearch, FiSun, FiLogOut } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { setSidebarOpen, setMobileDrawerOpen, dark, setDark } = useApp();
  const { user, currentLab, logout } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSignOut = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-[73px] items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 md:px-7">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger → opens MobileDrawer */}
        <button
          className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          className="hidden h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:flex"
          onClick={() => setSidebarOpen(prev => !prev)}
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 xl:w-72"
            placeholder="Search patients, reports..."
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Date/time + lab ID */}
        <div className="hidden text-right lg:block">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{format(now, 'EEEE, dd MMM yyyy')}</p>
          <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
            {format(now, 'hh:mm a')} IST
            {currentLab?.labId && <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{currentLab.labId}</span>}
          </p>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <FiSun className="text-amber-400" /> : <FiMoon />}
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <FiBell />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User avatar + sign out dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="User menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2.5 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {user?.avatar || 'A'}
            </span>
            <FiChevronDown className="text-slate-400 hidden sm:block" />
          </button>
          {/* Dropdown */}
          <div className={`absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition-all duration-150 dark:border-slate-700 dark:bg-slate-900 ${menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.adminName || 'Administrator'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
              {currentLab?.labId && (
                <span className="mt-1 inline-block font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">{currentLab.labId}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 transition-colors"
            >
              <FiLogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
