/**
 * labService.js
 * ─────────────
 * Manages the global laboratory registry.
 *
 * Global key: labpro_registry  → Array of LabRecord
 *
 * LabRecord shape:
 * {
 *   labId:        string   'LAB001'
 *   labName:      string
 *   ownerName:    string
 *   adminName:    string
 *   mobile:       string
 *   email:        string   (unique, used for login)
 *   passwordHash: string   (SHA-256 hex via Web Crypto)
 *   address:      string
 *   city:         string
 *   state:        string
 *   pincode:      string
 *   logo:         string | null  (base64 data-url)
 *   createdAt:    string  (ISO 8601)
 * }
 *
 * SECURITY NOTE:
 *   SHA-256 is used here because this runs entirely in the browser.
 *   When a Node.js + MongoDB backend is added, switch to bcrypt on
 *   the server and remove all password handling from the frontend.
 */

import storageService from './storageService';

const REGISTRY_KEY = 'registry'; // → labpro_registry

/* ─── Crypto helpers ──────────────────────────────────────── */

/**
 * Hash a plain-text password with SHA-256 (Web Crypto API).
 * Returns hex string.
 */
export async function hashPassword(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a plain-text password against a stored hash.
 */
export async function verifyPassword(plain, storedHash) {
  const hash = await hashPassword(plain);
  return hash === storedHash;
}

/* ─── Public API ──────────────────────────────────────────── */

const labService = {
  /** Load all registered labs. */
  getAllLabs() {
    return storageService.get(REGISTRY_KEY, []);
  },

  /** Save the full registry array. */
  _saveRegistry(arr) {
    storageService.set(REGISTRY_KEY, arr);
  },

  /** Find a lab by email (case-insensitive). */
  findByEmail(email) {
    const registry = this.getAllLabs();
    return registry.find(lab => lab.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /** Find a lab by labId. */
  findById(labId) {
    const registry = this.getAllLabs();
    return registry.find(lab => lab.labId === labId) || null;
  },

  /**
   * Self-registration is DISABLED.
   * Laboratories are created exclusively by the Super Admin.
   * This method is intentionally not implemented and always throws.
   */
  async registerLab() {
    throw new Error('Self-registration is disabled. Laboratories are provisioned by the Super Admin only.');
  },

  /**
   * Verify login credentials.
   * Returns the lab profile (no hash) on success, null on failure.
   * Rejects suspended / deleted / expired / inactive laboratories.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object|null>}
   */
  async verifyLogin(email, password) {
    const lab = this.findByEmail(email);
    if (!lab) return null;

    // Block login for suspended / deleted / expired / inactive accounts
    if (lab.status && lab.status !== 'Active') {
      console.warn(`[labService] Login blocked for ${lab.labId} — status: ${lab.status}`);
      return null;
    }

    const ok = await verifyPassword(password, lab.passwordHash);
    if (!ok) return null;
    const safelab = { ...lab };
    delete safelab.passwordHash;
    return safelab;
  },

  /**
   * Update the profile fields of an existing lab (not the password/hash).
   * Used by Settings page.
   */
  updateLabProfile(labId, patch) {
    const registry = this.getAllLabs();
    const updated = registry.map(lab =>
      lab.labId === labId ? { ...lab, ...patch } : lab
    );
    this._saveRegistry(updated);
    // Return updated safe profile
    const lab = updated.find(l => l.labId === labId);
    if (!lab) return null;
    const safelab = { ...lab };
    delete safelab.passwordHash;
    return safelab;
  },
};

export default labService;
