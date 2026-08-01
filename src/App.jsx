import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSuperAdmin } from './context/SuperAdminContext';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateReportPage from './pages/CreateReportPage';
import ReportsPage from './pages/ReportsPage';
import TestsPage from './pages/TestsPage';
import InvoicePage from './pages/InvoicePage';
import StaffPage from './pages/StaffPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLabsPage from './pages/admin/AdminLabsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminLoginHistoryPage from './pages/admin/AdminLoginHistoryPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminBackupPage from './pages/admin/AdminBackupPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import SetupPage from './pages/SetupPage';

/* ── Route gate component ─────────────────────────────────── */
function RootGate() {
  const { isAuthenticated, loading } = useAuth();
  const { isAdminAuthenticated, adminConfigured, adminLoading } = useSuperAdmin();

  // Wait for both session restores to settle before deciding where to go
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

  // First-ever run: no Super Admin yet → force the one-time setup page
  if (!adminConfigured) {
    return <Navigate to="/setup" replace />;
  }

  // Super Admin authenticated → Admin panel (never the lab dashboards)
  if (isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Lab authenticated → its own dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Unauthenticated (and admin exists) → always the Login page
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminConfigured } = useSuperAdmin();

  return (
    <Routes>
      {/* ── Root ── */}
      <Route path="*" element={<RootGate />} />

      {/* ── First-run Super Admin setup (single use) ── */}
      <Route
        path="/setup"
        element={adminConfigured ? <Navigate to="/login" replace /> : <SetupPage />}
      />

      {/* ── Unified Login (Super Admin OR Laboratory) ── */}
      <Route
        path="/login"
        element={
          !adminConfigured ? (
            <Navigate to="/setup" replace />
          ) : isAdminAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* ── Super Admin Panel (isolated) ── */}
      <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route path="/admin"                  element={<AdminDashboardPage />} />
        <Route path="/admin/labs"             element={<AdminLabsPage />} />
        <Route path="/admin/subscriptions"    element={<AdminSubscriptionsPage />} />
        <Route path="/admin/payments"         element={<AdminPaymentsPage />} />
        <Route path="/admin/activity"         element={<AdminActivityPage />} />
        <Route path="/admin/login-history"    element={<AdminLoginHistoryPage />} />
        <Route path="/admin/notifications"    element={<AdminNotificationsPage />} />
        <Route path="/admin/backup"           element={<AdminBackupPage />} />
        <Route path="/admin/settings"         element={<AdminSettingsPage />} />
      </Route>

      {/* ── Protected Lab routes ── */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"      element={<DashboardPage />} />
        <Route path="/reports/create" element={<CreateReportPage />} />
        <Route path="/reports"        element={<ReportsPage />} />
        <Route path="/tests"          element={<TestsPage />} />
        <Route path="/invoice"        element={<InvoicePage />} />
        <Route path="/staff"          element={<StaffPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

