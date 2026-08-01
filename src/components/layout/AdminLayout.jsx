import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 transition-colors overflow-x-hidden">
      {/* Desktop sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        }`}
      >
        {/* Top bar for admin */}
        <header className="sticky top-0 z-30 flex h-[73px] items-center justify-between border-b border-slate-800 bg-slate-900/85 px-4 backdrop-blur-xl md:px-7">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 text-xs font-bold text-white">
                FC
              </span>
              <span className="text-sm font-semibold text-white hidden sm:block">Fast Coders Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-7 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}