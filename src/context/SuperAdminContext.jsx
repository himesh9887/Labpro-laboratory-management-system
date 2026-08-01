/**
 * SuperAdminContext.jsx
 * ─────────────────────
 * Manages Super Admin authentication state separately from laboratory auth.
 *
 * Exposes:
 *   isAdminAuthenticated — boolean
 *   adminConfigured      — whether the single Super Admin account exists
 *   adminLoading         — true during initial session restore
 *   adminSession         — current admin session object
 *   adminLogin(email, password, rememberMe) → Promise
 *   adminLogout()
 *
 * Session storage:
 *   rememberMe = true  → localStorage  (persists across browser restart)
 *   rememberMe = false → sessionStorage (cleared when tab/window is closed)
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import storageService from '../services/storageService';

const SESSION_KEY = 'admin_session';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminConfigured, setAdminConfigured] = useState(false);

  /* ── Session restore on mount ────────────────────────── */
  useEffect(() => {
    try {
      // Priority: localStorage (rememberMe) → sessionStorage
      const raw = storageService.get(SESSION_KEY, null) ||
        (() => {
          try {
            const ss = sessionStorage.getItem('labpro_' + SESSION_KEY);
            return ss ? JSON.parse(ss) : null;
          } catch {
            return null;
          }
        })();

      if (raw && raw?.email && raw?.role === 'super_admin') {
        // Verify the single admin account still exists; never allow stale sessions
        if (adminService.hasAdminAccount()) {
          setAdminSession({
            ...raw,
            name: raw.name || 'Super Admin',
          });
        } else {
          storageService.remove(SESSION_KEY);
          sessionStorage.removeItem('labpro_' + SESSION_KEY);
        }
      }
      setAdminConfigured(adminService.hasAdminAccount());
    } catch {
      storageService.remove(SESSION_KEY);
      sessionStorage.removeItem('labpro_' + SESSION_KEY);
      setAdminConfigured(adminService.hasAdminAccount());
    } finally {
      setAdminLoading(false);
    }
  }, []);

  /* ── Login ────────────────────────────────────────────── */
  const adminLogin = useCallback(async (email, password, rememberMe = false) => {
    const result = await adminService.verifyAdminLogin(email, password);
    if (!result) {
      throw new Error('Invalid admin credentials. Access denied.');
    }
    const session = {
      ...result,
      loginTime: new Date().toISOString(),
      rememberMe,
    };

    if (rememberMe) {
      storageService.set(SESSION_KEY, session);
      sessionStorage.removeItem('labpro_' + SESSION_KEY);
    } else {
      sessionStorage.setItem('labpro_' + SESSION_KEY, JSON.stringify(session));
      storageService.remove(SESSION_KEY);
    }

    setAdminSession(session);
    setAdminConfigured(true);
    toast.success(`Welcome, ${session.name || 'Super Admin'}!`);
    return session;
  }, []);

  /* ── Logout ──────────────────────────────────────────── */
  const adminLogout = useCallback(() => {
    storageService.remove(SESSION_KEY);
    try {
      sessionStorage.removeItem('labpro_' + SESSION_KEY);
    } catch {
      // ignore
    }
    setAdminSession(null);
    toast.success('Signed out successfully.');
  }, []);

  const value = {
    isAdminAuthenticated: !!adminSession,
    adminConfigured,
    superAdminCreated: adminConfigured,
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

