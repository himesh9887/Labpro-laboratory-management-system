import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiX, FiLogOut } from 'react-icons/fi';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { adminNavigation } from '../../constants/adminNavigation';

export default function AdminMobileDrawer({ open, onClose }) {
  const { adminLogout } = useSuperAdmin();
  const navigate = useNavigate();
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0]?.clientX - touchStartX;
    if (deltaX < -48) {
      onClose(false);
    }
    setTouchStartX(null);
  };

  const handleSignOut = () => {
    onClose(false);
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onClose(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation menu"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 font-display text-sm font-bold text-white shadow-lg shadow-amber-900/40">
              FC
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-white">Fast Coders</p>
              <p className="text-[10px] font-medium uppercase tracking-[.18em] text-amber-300">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => onClose(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {adminNavigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => onClose(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="text-lg shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <FiLogOut className="shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
