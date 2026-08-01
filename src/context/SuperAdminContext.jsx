/**
 * SuperAdminContext.jsx
 * ─────────────────────
 * Manages Super Admin authentication state separately from laboratory auth.
 *
 * Exposes:
 *   isAdminAuthenticated — boolean
 *   adminLoading         — true during initial session restore
 *   adminLogin(email, password) → Promise
 *   adminLogout()
 *   adminSession         — current admin session object
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import storageService from '../services/storageService';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminConfigured, setAdminConfigured] = useState(false);

  /* ── Session restore on mount ────────────────────────── */
  useEffect(() => {
    try {
      const raw = storageService.get('admin_session', null);
      if (raw) {
        if (raw?.email && raw?.role === 'super_admin') {
          setAdminSession(raw);
        }
      }
      setAdminConfigured(adminService.hasAdminAccount());
    } catch {
      storageService.remove('admin_session');
      setAdminConfigured(adminService.hasAdminAccount());
    } finally {
      setAdminLoading(false);
    }
  }, []);

  /* ── Login ────────────────────────────────────────────── */
  const adminLogin = useCallback(async (email, password) => {
    const result = await adminService.verifyAdminLogin(email, password);
    if (!result) {
      throw new Error('Invalid admin credentials. Access denied.');
    }
    const session = { ...result, loginTime: new Date().toISOString() };
    storageService.set('admin_session', session);
    setAdminSession(session);
    setAdminConfigured(true);
    toast.success('Welcome, Super Admin!');
    return session;
  }, []);

  /* ── Logout ──────────────────────────────────────────── */
  const adminLogout = useCallback(() => {
    storageService.remove('admin_session');
    setAdminSession(null);
    toast.success('Signed out successfully.');
  }, []);

  const value = {
    isAdminAuthenticated: !!adminSession,
    adminConfigured,
    adminLoading,
    adminSession,
    adminLogin,
    adminLogout: adminLogout,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return ctx;
}
