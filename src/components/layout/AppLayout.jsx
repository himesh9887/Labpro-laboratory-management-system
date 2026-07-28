import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
export default function AppLayout() { return <div className="min-h-screen bg-slate-50"><Sidebar /><div className="min-h-screen transition-all lg:ml-72"><Topbar /><main className="app-grid min-h-[calc(100vh-73px)] p-4 md:p-7"><Outlet /></main></div></div>; }
