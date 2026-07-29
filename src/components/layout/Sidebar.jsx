import { NavLink, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { navigation } from '../../constants/navigation';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = () => { logout(); navigate('/login'); };

  return (
    // hidden on mobile/tablet, flex on lg+
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r bg-slate-950 transition-all duration-300 ${
        sidebarOpen ? 'w-72' : 'w-20'
      } border-slate-800`}
    >
      {/* Logo */}
      <div className={`flex items-center px-4 py-5 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'gap-0 flex-col'}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 font-display text-lg font-bold text-white shadow-lg shadow-blue-900/40">L</span>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-display text-lg font-semibold text-white whitespace-nowrap">LabPro</p>
              <p className="text-[10px] font-medium uppercase tracking-[.18em] text-blue-300 whitespace-nowrap">LIMS platform</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`rounded-lg p-2 text-slate-400 hover:bg-white/10 transition-all ${
            sidebarOpen ? '' : 'absolute -right-3 top-7 bg-slate-800 border border-slate-700'
          }`}
        >
          {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} rounded-xl py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="text-lg shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile */}
      <div className={`px-3 pb-5 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
        <div className={`rounded-2xl bg-white/5 p-3 w-full ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-2 mb-3' : 'gap-0 flex-col mb-2'}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-xs font-bold text-white">
              {user?.avatar || 'DK'}
            </span>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white whitespace-nowrap">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 whitespace-nowrap">{user?.role || 'Administrator'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={`flex items-center ${
              sidebarOpen ? 'w-full gap-2 px-2 py-2' : 'justify-center p-2'
            } rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all`}
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <FiLogOut className="shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
