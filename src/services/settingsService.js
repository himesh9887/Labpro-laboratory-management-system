/**
 * settingsService.js
 * ──────────────────
 * Reads and writes LabPro application settings.
 * Key: labpro_settings
 */

import storageService from './storageService';

const KEY = 'settings';

const DEFAULTS = {
  autoClear: true,          // Reset daily data at midnight
  keepHistory: true,        // Archive old invoices instead of deleting
  retentionDays: 7,         // 1 | 7 | 15 | 30 | null (never)
  labProfile: {
    name: 'LabPro Diagnostics',
    license: 'NABL-2026-48091',
    email: 'care@labprodiagnostics.in',
    phone: '+91 80 4567 8900',
    address: '24, Health Plaza, Indiranagar, Bengaluru, Karnataka 560038',
  },
};

const settingsService = {
  getSettings() {
    const stored = storageService.get(KEY, {});
    return { ...DEFAULTS, ...stored, labProfile: { ...DEFAULTS.labProfile, ...(stored.labProfile || {}) } };
  },

  saveSettings(patch) {
    const current = this.getSettings();
    const updated = { ...current, ...patch };
    if (patch.labProfile) {
      updated.labProfile = { ...current.labProfile, ...patch.labProfile };
    }
    storageService.set(KEY, updated);
    return updated;
  },

  resetSettings() {
    storageService.set(KEY, DEFAULTS);
    return DEFAULTS;
  },
};

export default settingsService;
