/**
 * storageService.js
 * ─────────────────
 * Central localStorage wrapper.
 *
 * GLOBAL prefix: 'labpro_'  (used for registry, session — not lab data)
 * PER-LAB prefix: 'labpro_<LABID>_'  (all lab-specific data)
 *
 * Use createScopedStorage(labId) to get a namespaced instance.
 * ALL reads/writes for lab data MUST go through a scoped instance.
 *
 * Future-ready: swap the implementation to IndexedDB or an API without
 * touching any UI component.
 */

const GLOBAL_PREFIX = 'labpro_';

/* ─── Global (unscoped) storage — registry, session ──────── */
const storageService = {
  /**
   * Read and JSON-parse a key. Returns `fallback` on any error.
   * If data is corrupted (bad JSON), removes the corrupted key to prevent
   * cascading failures and returns the fallback.
   */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(GLOBAL_PREFIX + key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw);
      } catch (parseErr) {
        console.warn(`[storageService] Corrupted data detected for key "${GLOBAL_PREFIX}${key}". Removing and using fallback.`, parseErr);
        localStorage.removeItem(GLOBAL_PREFIX + key);
        return fallback;
      }
    } catch {
      return fallback;
    }
  },

  /**
   * JSON-stringify and write a key.
   */
  set(key, value) {
    try {
      localStorage.setItem(GLOBAL_PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error('[storageService] set failed:', key, err);
    }
  },

  /**
   * Remove a single key.
   */
  remove(key) {
    try {
      localStorage.removeItem(GLOBAL_PREFIX + key);
    } catch {
      // ignore
    }
  },

  /**
   * Remove ALL labpro_* keys (full wipe — use only for dev/debug).
   */
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(GLOBAL_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },

  /**
   * Export all labpro_* keys as a plain object (for JSON download).
   */
  exportAll() {
    const out = {};
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(GLOBAL_PREFIX))
        .forEach(k => {
          try { out[k] = JSON.parse(localStorage.getItem(k)); } catch { out[k] = localStorage.getItem(k); }
        });
    } catch {
      // ignore
    }
    return out;
  },

  /**
   * Import a full backup object (keys may or may not include the prefix).
   */
  importAll(data) {
    try {
      Object.entries(data).forEach(([k, v]) => {
        const key = k.startsWith(GLOBAL_PREFIX) ? k : GLOBAL_PREFIX + k;
        localStorage.setItem(key, JSON.stringify(v));
      });
    } catch (err) {
      console.error('[storageService] importAll failed:', err);
    }
  },
};

/* ─── Scoped storage factory ──────────────────────────────── */
/**
 * createScopedStorage(labId)
 * ──────────────────────────
 * Returns a storage object with the SAME API as storageService but
 * namespaced to a specific lab:  labpro_<LABID>_<key>
 *
 * Example:  createScopedStorage('LAB001').get('invoices', [])
 *           → reads localStorage key 'labpro_LAB001_invoices'
 */
export function createScopedStorage(labId) {
  if (!labId) throw new Error('[createScopedStorage] labId is required');
  const SCOPED_PREFIX = `${GLOBAL_PREFIX}${labId}_`;

  return {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(SCOPED_PREFIX + key);
        if (raw === null) return fallback;
        try {
          return JSON.parse(raw);
        } catch (parseErr) {
          console.warn(`[scopedStorage:${labId}] Corrupted data for key "${SCOPED_PREFIX}${key}". Removing.`, parseErr);
          localStorage.removeItem(SCOPED_PREFIX + key);
          return fallback;
        }
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(SCOPED_PREFIX + key, JSON.stringify(value));
      } catch (err) {
        console.error(`[scopedStorage:${labId}] set failed:`, key, err);
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(SCOPED_PREFIX + key);
      } catch {
        // ignore
      }
    },

    /** Remove all keys belonging to this specific lab. */
    clearAll() {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(SCOPED_PREFIX))
          .forEach(k => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    },

    /** Export all keys of this lab as a plain object. */
    exportAll() {
      const out = {};
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(SCOPED_PREFIX))
          .forEach(k => {
            try { out[k] = JSON.parse(localStorage.getItem(k)); } catch { out[k] = localStorage.getItem(k); }
          });
      } catch {
        // ignore
      }
      return out;
    },

    /** Import a backup into this lab's namespace. */
    importAll(data) {
      try {
        Object.entries(data).forEach(([k, v]) => {
          const key = k.startsWith(SCOPED_PREFIX) ? k : SCOPED_PREFIX + k;
          localStorage.setItem(key, JSON.stringify(v));
        });
      } catch (err) {
        console.error(`[scopedStorage:${labId}] importAll failed:`, err);
      }
    },

    /** Expose labId for debugging. */
    labId,
    prefix: SCOPED_PREFIX,
  };
}

export default storageService;
