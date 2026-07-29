import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
export default function AppLayout() {
  const { sidebarOpen } = useApp();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <Topbar />
        <main className="app-grid min-h-[calc(100vh-73px)] p-4 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
