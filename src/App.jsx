import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSuperAdmin } from './context/SuperAdminContext';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
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

export default function App() {
  const { isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminConfigured } = useSuperAdmin();

  return (
    <Routes>
      <Route
        path="/setup"
        element={isAdminAuthenticated ? <Navigate to="/admin" replace /> : adminConfigured ? <Navigate to="/admin/login" replace /> : <SetupPage />}
      />

      {/* ── Super Admin Auth Routes ── */}
      <Route
        path="/admin/login"
        element={isAdminAuthenticated ? <Navigate to="/admin" replace /> : adminConfigured ? <AdminLoginPage /> : <Navigate to="/setup" replace />}
      />

      {/* ── Lab Auth Routes — redirect to dashboard if already logged in ── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* ── Super Admin Panel (separate app) ── */}
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

      {/* ── Catch-all ── */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : isAdminAuthenticated ? '/admin' : adminConfigured ? '/admin/login' : '/setup'} replace />}
      />
    </Routes>
  );
}

