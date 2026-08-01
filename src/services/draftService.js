/**
 * draftService.js
 * ───────────────
 * Save and restore in-progress Invoice or Report drafts.
 * Factory: call createDraftService(scopedStorage) for a lab-scoped instance.
 *
 * Keys:
 *   draft_invoice
 *   draft_report
 */

export function createDraftService(storage) {
  const KEYS = {
    invoice: 'draft_invoice',
    report:  'draft_report',
  };

  return {
    saveDraft(type, data) {
      const key = KEYS[type];
      if (!key) return;
      storage.set(key, {
        data,
        savedAt: new Date().toISOString(),
      });
    },

    loadDraft(type) {
      const key = KEYS[type];
      if (!key) return null;
      return storage.get(key, null);
    },

    hasDraft(type) {
      return this.loadDraft(type) !== null;
    },

    clearDraft(type) {
      const key = KEYS[type];
      if (!key) return;
      storage.remove(key);
    },

    clearAllDrafts() {
      Object.values(KEYS).forEach(k => storage.remove(k));
    },
  };
}

/* ── Legacy singleton (do NOT use for new code) ──────── */
import storageService from './storageService';
const _legacy = createDraftService(storageService);
export default _legacy;
