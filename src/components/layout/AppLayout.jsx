import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileDrawer from './MobileDrawer';

export default function AppLayout() {
  const { sidebarOpen } = useApp();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-x-hidden">
      {/* Desktop sidebar – hidden on mobile */}
      <Sidebar />

      {/* Mobile slide drawer */}
      <MobileDrawer />

      {/* Main content area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        }`}
      >
        <Topbar />
        <main className="app-grid min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
