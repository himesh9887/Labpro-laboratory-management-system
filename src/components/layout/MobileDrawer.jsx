import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { navigation } from '../../constants/navigation';

export default function MobileDrawer() {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setMobileDrawerOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  const handleSignOut = () => {
    setMobileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const handleNav = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-slate-950 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/40 text-sm">
              L
            </span>
            <div>
              <p className="font-semibold text-white text-sm">LabPro</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-blue-300">LIMS Platform</p>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNav}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="text-lg shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile + Sign Out */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-xs font-bold text-white">
                {user?.avatar || 'DK'}
              </span>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <FiLogOut className="shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
