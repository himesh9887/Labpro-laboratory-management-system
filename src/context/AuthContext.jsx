/**
 * AuthContext.jsx
 * ───────────────
 * Multi-laboratory authentication context.
 *
 * Exposes:
 *   user            — { labId, labName, adminName, email, avatar }
 *   currentLab      — full lab profile from registry (no passwordHash)
 *   labId           — e.g. 'LAB001'
 *   scopedStorage   — createScopedStorage(labId) instance
 *   isAuthenticated — boolean
 *   loading         — true during initial session restore
 *   login(email, password, rememberMe) → Promise
 *   register(formData) → Promise
 *   logout()
 *
 * Session restore flow:
 *   1. Check sessionService for stored session
 *   2. Validate lab still exists in registry
 *   3. Initialize scoped storage
 *   4. Set user state → DataContext can now initialize per-lab data
 *
 * Future-ready: swap labService / sessionService for API calls without
 * changing any UI or DataContext code.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import labService from '../services/labService';
import sessionService from '../services/sessionService';
import { createScopedStorage } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [currentLab,    setCurrentLab]      = useState(null);
  const [labId,          setLabId]           = useState(null);
  const [scopedStorage,  setScopedStorage]   = useState(null);
  const [loading,        setLoading]         = useState(true);

  /* ── helpers ─────────────────────────────────────────── */
  function buildUserObject(lab) {
    const initials = (lab.adminName || lab.labName || 'LA')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      labId:     lab.labId,
      labName:   lab.labName,
      adminName: lab.adminName,
      ownerName: lab.ownerName,
      email:     lab.email,
      role:      'Administrator',
      avatar:    initials,
    };
  }

  const activateSession = useCallback((lab) => {
    const scoped = createScopedStorage(lab.labId);
    setLabId(lab.labId);
    setScopedStorage(scoped);
    setCurrentLab(lab);
    setUser(buildUserObject(lab));
  }, []);

  /* ── Session restore on mount ────────────────────────── */
  useEffect(() => {
    try {
      const session = sessionService.restoreSession();
      if (session?.labId) {
        // Validate the session is not expired (optional: add expiry check)
        const lab = labService.findById(session.labId);
        if (lab) {
          // A suspended / deleted / expired / inactive lab must not keep an active session
          if (lab.status && lab.status !== 'Active') {
            console.warn(`[AuthContext] Session blocked for ${lab.labId} — status: ${lab.status}`);
            sessionService.clearSession();
          } else if (lab.email.toLowerCase() !== session.email?.toLowerCase()) {
            // Verify the email in session matches the registered email
            console.warn('[AuthContext] Session email mismatch — clearing session');
            sessionService.clearSession();
          } else {
            activateSession(lab);
          }
        } else {
          // Registry was wiped or lab no longer exists — clear orphaned session
          console.warn('[AuthContext] Lab not found in registry — clearing orphaned session');
          sessionService.clearSession();
        }
      }
    } catch (err) {
      console.error('[AuthContext] session restore failed:', err);
      sessionService.clearSession();
    } finally {
      setLoading(false);
    }
  }, [activateSession]);

  /* ── Register ────────────────────────────────────────── */
  const register = useCallback(async (formData) => {
    const lab = await labService.registerLab(formData);
    // Auto-login after registration (always remember — they just created the lab)
    sessionService.saveSession(lab.labId, lab.email, true);
    activateSession(lab);
    toast.success(`Welcome to LabPro! ${lab.labName} (${lab.labId}) registered successfully.`);
    return lab;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Login ───────────────────────────────────────────── */
  const login = useCallback(async (email, password, rememberMe = false) => {
    const lab = await labService.verifyLogin(email, password);
    if (!lab) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    sessionService.saveSession(lab.labId, lab.email, rememberMe);
    activateSession(lab);
    toast.success(`Welcome back! Signed in as ${lab.labName}`);
    return lab;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Logout ──────────────────────────────────────────── */
  const logout = useCallback(() => {
    sessionService.clearSession();
    setUser(null);
    setCurrentLab(null);
    setLabId(null);
    setScopedStorage(null);
    toast.success('Signed out successfully. Your data is safe.');
  }, []);

  /* ── Update lab profile (called from Settings) ───────── */
  const updateLabProfile = useCallback((patch) => {
    if (!labId) return null;
    const updated = labService.updateLabProfile(labId, patch);
    if (updated) {
      setCurrentLab(updated);
      setUser(buildUserObject(updated));
    }
    return updated;
  }, [labId]);

  const value = {
    user,
    currentLab,
    labId,
    scopedStorage,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateLabProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
