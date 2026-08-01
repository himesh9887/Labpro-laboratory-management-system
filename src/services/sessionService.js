/**
 * sessionService.js
 * ─────────────────
 * Manages the active laboratory session.
 *
 * Session shape:
 * {
 *   labId:      string   'LAB001'
 *   email:      string
 *   rememberMe: boolean
 *   savedAt:    string (ISO)
 * }
 *
 * Storage strategy:
 *   rememberMe = true  → localStorage   (persists across browser restart)
 *   rememberMe = false → sessionStorage  (cleared when tab/window is closed)
 *
 * The session key is intentionally NOT namespaced with a labId because
 * it IS the record that tells us which labId to load.
 *
 * Future-ready: swap localStorage for a secure HttpOnly cookie + JWT
 * by replacing saveSession / restoreSession here without touching any UI.
 */

const SESSION_KEY = 'labpro_session';

const sessionService = {
  /**
   * Persist a session for the logged-in lab.
   * @param {string} labId
   * @param {string} email
   * @param {boolean} rememberMe
   */
  saveSession(labId, email, rememberMe) {
    const session = {
      labId,
      email,
      rememberMe,
      savedAt: new Date().toISOString(),
    };
    const raw = JSON.stringify(session);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, raw);
      // Remove from sessionStorage if it was there
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
      // Remove from localStorage if it was there
      localStorage.removeItem(SESSION_KEY);
    }
  },

  /**
   * Restore a persisted session.
   * Checks localStorage first (rememberMe), then sessionStorage.
   * Returns the session object or null.
   *
   * @returns {{ labId: string, email: string, rememberMe: boolean } | null}
   */
  restoreSession() {
    try {
      // Priority: localStorage (rememberMe) → sessionStorage
      const lsRaw = localStorage.getItem(SESSION_KEY);
      if (lsRaw) {
        const session = JSON.parse(lsRaw);
        if (session?.labId) return session;
      }
      const ssRaw = sessionStorage.getItem(SESSION_KEY);
      if (ssRaw) {
        const session = JSON.parse(ssRaw);
        if (session?.labId) return session;
      }
    } catch {
      // ignore malformed
    }
    return null;
  },

  /**
   * Clear the current session from all storage.
   * Does NOT delete any lab data.
   */
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },

  /**
   * Check whether any session currently exists.
   */
  hasSession() {
    return this.restoreSession() !== null;
  },
};

export default sessionService;
