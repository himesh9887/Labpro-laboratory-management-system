/**
 * settingsService.js
 * ──────────────────
 * Reads and writes LabPro application settings.
 * Factory: call createSettingsService(scopedStorage) for a lab-scoped instance.
 * Key: settings
 *
 * Each laboratory has completely independent settings including lab profile,
 * retention preferences, theme, etc.
 */

export function createSettingsService(storage) {
  const KEY = 'settings';

  const DEFAULTS = {
    autoClear: true,
    keepHistory: true,
    retentionDays: 7,
    labProfile: {
      name:    '',
      license: '',
      email:   '',
      phone:   '',
      address: '',
      website: '',
      logo:    null,
    },
  };

  return {
    getSettings() {
      const stored = storage.get(KEY, {});
      return {
        ...DEFAULTS,
        ...stored,
        labProfile: { ...DEFAULTS.labProfile, ...(stored.labProfile || {}) },
      };
    },

    saveSettings(patch) {
      const current = this.getSettings();
      const updated = { ...current, ...patch };
      if (patch.labProfile) {
        updated.labProfile = { ...current.labProfile, ...patch.labProfile };
      }
      storage.set(KEY, updated);
      return updated;
    },

    resetSettings() {
      storage.set(KEY, DEFAULTS);
      return DEFAULTS;
    },
  };
}

/* ── Legacy singleton (do NOT use for new code) ──────── */
import storageService from './storageService';
const _legacy = createSettingsService(storageService);
export default _legacy;
