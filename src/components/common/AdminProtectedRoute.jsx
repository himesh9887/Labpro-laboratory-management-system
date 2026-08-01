import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminProtectedRoute
 * ───────────────────
 * Only authenticated Super Admin may access the children.
 * If a Lab account is authenticated, send them away from admin routes.
 * Unauthenticated users always go to the unified Login page.
 */
export default function AdminProtectedRoute({ children }) {
  const { isAdminAuthenticated, adminLoading } = useSuperAdmin();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (adminLoading || loading) {
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

  // Lab user trying to reach the admin panel → send to lab dashboard
  if (isAuthenticated && !isAdminAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

