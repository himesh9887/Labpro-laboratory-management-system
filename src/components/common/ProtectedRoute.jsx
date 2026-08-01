import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';

/**
 * ProtectedRoute
 * ──────────────
 * Only an authenticated Laboratory may access the children.
 * A Super Admin trying to open a lab route is sent to the Admin panel.
 * Unauthenticated users always go to the unified Login page.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { isAdminAuthenticated, adminLoading } = useSuperAdmin();
  const location = useLocation();

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 font-display text-2xl font-bold text-white shadow-lg shadow-blue-900/40 animate-pulse">
            L
          </span>
          <p className="text-sm font-medium text-slate-500">Loading LabPro...</p>
        </div>
      </div>
    );
  }

  // Super Admin attempting to open a lab route → admin panel
  if (isAdminAuthenticated && !isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

