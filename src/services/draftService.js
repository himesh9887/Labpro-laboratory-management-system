/**
 * draftService.js
 * ───────────────
 * Save and restore in-progress Invoice or Report drafts.
 * If a user refreshes mid-wizard, their work can be recovered.
 *
 * Keys:
 *   labpro_draft_invoice
 *   labpro_draft_report
 */

import storageService from './storageService';

const KEYS = {
  invoice: 'draft_invoice',
  report:  'draft_report',
};

const draftService = {
  /** Save draft data for 'invoice' or 'report'. */
  saveDraft(type, data) {
    const key = KEYS[type];
    if (!key) return;
    storageService.set(key, {
      data,
      savedAt: new Date().toISOString(),
    });
  },

  /** Load a draft. Returns { data, savedAt } or null. */
  loadDraft(type) {
    const key = KEYS[type];
    if (!key) return null;
    return storageService.get(key, null);
  },

  /** Check if a draft exists. */
  hasDraft(type) {
    return draftService.loadDraft(type) !== null;
  },

  /** Remove the draft after it's been submitted or discarded. */
  clearDraft(type) {
    const key = KEYS[type];
    if (!key) return;
    storageService.remove(key);
  },

  /** Clear all drafts. */
  clearAllDrafts() {
    Object.values(KEYS).forEach(k => storageService.remove(k));
  },
};

export default draftService;
