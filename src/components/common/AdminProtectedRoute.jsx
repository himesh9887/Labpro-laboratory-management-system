import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated, adminLoading } = useSuperAdmin();
  const location = useLocation();

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 font-display text-2xl font-bold text-white shadow-lg shadow-amber-900/40 animate-pulse">
            FC
          </span>
          <p className="text-sm font-medium text-slate-400">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

