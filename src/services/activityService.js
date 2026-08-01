/**
 * activityService.js
 * ──────────────────
 * Persistent activity log. Stores the last 100 events per laboratory.
 * Factory: call createActivityService(scopedStorage) for a lab-scoped instance.
 * Key: activity_log
 */

export const EVENT_TYPES = {
  INVOICE_CREATED:    'invoice_created',
  INVOICE_UPDATED:    'invoice_updated',
  INVOICE_DELETED:    'invoice_deleted',
  PAYMENT_RECEIVED:   'payment_received',
  REPORT_CREATED:     'report_created',
  REPORT_UPDATED:     'report_updated',
  REPORT_DELETED:     'report_deleted',
  REPORT_VERIFIED:    'report_verified',
  REPORT_PRINTED:     'report_printed',
  REPORT_DELIVERED:   'report_delivered',
  TEST_ADDED:         'test_added',
  TEST_UPDATED:       'test_updated',
  TEST_DELETED:       'test_deleted',
  PATIENT_REGISTERED: 'patient_registered',
  STAFF_ADDED:        'staff_added',
  TIMELINE_UPDATED:   'timeline_updated',
  SETTINGS_SAVED:     'settings_saved',
  LAB_REGISTERED:     'lab_registered',
  LAB_LOGIN:          'lab_login',
};

const ICON_MAP = {
  invoice_created:    '🧾',
  invoice_updated:    '✏️',
  invoice_deleted:    '🗑️',
  payment_received:   '💰',
  report_created:     '📋',
  report_updated:     '📝',
  report_deleted:     '🗑️',
  report_verified:    '✅',
  report_printed:     '🖨️',
  report_delivered:   '📦',
  test_added:         '🔬',
  test_updated:       '🔬',
  test_deleted:       '🗑️',
  patient_registered: '👤',
  staff_added:        '👥',
  timeline_updated:   '📌',
  settings_saved:     '⚙️',
  lab_registered:     '🏥',
  lab_login:          '🔐',
};

const MAX_LOG = 100;

export function createActivityService(storage) {
  const KEY = 'activity_log';

  return {
    loadLog() {
      return storage.get(KEY, []);
    },

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
      storage.set(KEY, updated);
      return entry;
    },

    clearLog() {
      storage.set(KEY, []);
    },
  };
}

/* ── Legacy singleton (do NOT use for new code) ──────── */
import storageService from './storageService';
const _legacy = createActivityService(storageService);
export default _legacy;
