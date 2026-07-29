/**
 * storageService.js
 * ─────────────────
 * Central localStorage wrapper.
 * ALL reads/writes MUST go through here — never call localStorage directly.
 * Future-ready: swap the implementation to IndexedDB or an API without
 * touching any UI component.
 */

const PREFIX = 'labpro_';

const storageService = {
  /**
   * Read and JSON-parse a key. Returns `fallback` on any error.
   */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  /**
   * JSON-stringify and write a key.
   */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.error('[storageService] set failed:', key, err);
    }
  },

  /**
   * Remove a single key.
   */
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },

  /**
   * Remove ALL labpro_* keys (full wipe).
   */
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
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
        .filter(k => k.startsWith(PREFIX))
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
        const key = k.startsWith(PREFIX) ? k : PREFIX + k;
        localStorage.setItem(key, JSON.stringify(v));
      });
    } catch (err) {
      console.error('[storageService] importAll failed:', err);
    }
  },
};

export default storageService;
