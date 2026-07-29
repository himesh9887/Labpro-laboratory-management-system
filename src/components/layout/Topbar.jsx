import { FiBell, FiChevronDown, FiMenu, FiMoon, FiSearch, FiSun } from 'react-icons/fi';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { setSidebarOpen, setMobileDrawerOpen, dark, setDark } = useApp();
  const { user } = useAuth();
  const now = new Date();

  return (
    <header className="sticky top-0 z-30 flex h-[73px] items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 md:px-7">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger → opens MobileDrawer */}
        <button
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu className="text-xl" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          className="hidden lg:flex rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div className="hidden text-right lg:block">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{format(now, 'EEEE, dd MMM yyyy')}</p>
          <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{format(now, 'hh:mm a')} IST</p>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <FiSun className="text-amber-400" /> : <FiMoon />}
        </button>

        <button
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <FiBell />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2.5 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {user?.avatar || 'A'}
          </span>
          <FiChevronDown className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
