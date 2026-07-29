/**
 * activityService.js
 * ──────────────────
 * Persistent activity log. Stores the last 100 events in localStorage.
 *
 * Key: labpro_activity_log
 *
 * Event shape:
 * {
 *   id:        string  (timestamp-based unique ID)
 *   type:      string  ('invoice_created' | 'invoice_deleted' | 'report_created' | ...)
 *   icon:      string  (emoji or icon key)
 *   title:     string  (human-readable title)
 *   detail:    string  (extra info, e.g. patient name, invoice no)
 *   timestamp: string  (ISO 8601)
 * }
 */

import storageService from './storageService';

const KEY     = 'activity_log';
const MAX_LOG = 100;

/* ── Event type definitions ─────────────────────────────── */
export const EVENT_TYPES = {
  INVOICE_CREATED:   'invoice_created',
  INVOICE_UPDATED:   'invoice_updated',
  INVOICE_DELETED:   'invoice_deleted',
  PAYMENT_RECEIVED:  'payment_received',
  REPORT_CREATED:    'report_created',
  REPORT_UPDATED:    'report_updated',
  REPORT_DELETED:    'report_deleted',
  REPORT_VERIFIED:   'report_verified',
  REPORT_PRINTED:    'report_printed',
  REPORT_DELIVERED:  'report_delivered',
  TEST_ADDED:        'test_added',
  TEST_UPDATED:      'test_updated',
  TEST_DELETED:      'test_deleted',
  PATIENT_REGISTERED:'patient_registered',
  STAFF_ADDED:       'staff_added',
  TIMELINE_UPDATED:  'timeline_updated',
  SETTINGS_SAVED:    'settings_saved',
};

const ICON_MAP = {
  invoice_created:   '🧾',
  invoice_updated:   '✏️',
  invoice_deleted:   '🗑️',
  payment_received:  '💰',
  report_created:    '📋',
  report_updated:    '📝',
  report_deleted:    '🗑️',
  report_verified:   '✅',
  report_printed:    '🖨️',
  report_delivered:  '📦',
  test_added:        '🔬',
  test_updated:      '🔬',
  test_deleted:      '🗑️',
  patient_registered:'👤',
  staff_added:       '👥',
  timeline_updated:  '📌',
  settings_saved:    '⚙️',
};

const activityService = {
  /** Load all stored activity events (most recent first) */
  loadLog() {
    return storageService.get(KEY, []);
  },

  /**
   * Add a new event to the top of the log.
   * @param {string} type  — one of EVENT_TYPES values
   * @param {string} title — short human label
   * @param {string} detail — extra context
   * @returns the saved entry
   */
  addEvent(type, title, detail = '') {
    const log = this.loadLog();
    const entry = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      icon:      ICON_MAP[type] || '📌',
      title,
      detail,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...log].slice(0, MAX_LOG);
    storageService.set(KEY, updated);
    return entry;
  },

  /** Remove all activity log entries */
  clearLog() {
    storageService.set(KEY, []);
  },
};

export default activityService;
