/**
 * useDailyReset.js
 * ────────────────
 * Runs once per lab session at app startup. Compares the stored date with today.
 * If the date has changed, triggers the daily reset sequence:
 *   1. Archive yesterday's invoices (if keepHistory)
 *   2. Prune expired patients and reports (if autoClear)
 *   3. Reset invoice counter
 *   4. Write today's date to <labId>_today
 *
 * Accepts scopedStorage so the 'today' key is always lab-scoped:
 *   labpro_LAB001_today  (not a shared global key)
 *
 * Returns { isNewDay } so callers can react if needed.
 */

import { useEffect, useRef, useState } from 'react';
import { createInvoiceService }  from '../services/invoiceService';
import { createPatientService }  from '../services/patientService';
import { createReportService }   from '../services/reportService';
import { createSettingsService } from '../services/settingsService';

const TODAY_KEY = 'today';

function currentDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyReset(scopedStorage) {
  const [isNewDay, setIsNewDay] = useState(false);
  const ran = useRef(null); // tracks which labId we last ran for

  useEffect(() => {
    if (!scopedStorage) return;

    // Only run once per lab session (prevent double-fire in StrictMode)
    if (ran.current === scopedStorage.labId) return;
    ran.current = scopedStorage.labId;

    const today = currentDateStr();
    const meta  = scopedStorage.get(TODAY_KEY, { date: null, counter: 0 });

    if (meta.date === today) {
      // Same day — nothing to do
      return;
    }

    // ─── Daily Reset ──────────────────────────────────────
    const invoiceSvc  = createInvoiceService(scopedStorage);
    const patientSvc  = createPatientService(scopedStorage);
    const reportSvc   = createReportService(scopedStorage);
    const settingsSvc = createSettingsService(scopedStorage);

    const { keepHistory, autoClear, retentionDays } = settingsSvc.getSettings();
    const yesterday = meta.date;

    if (yesterday) {
      if (keepHistory) {
        const oldInvoices = invoiceSvc.loadInvoices();
        invoiceSvc.archiveToHistory(oldInvoices, yesterday);
        invoiceSvc.pruneHistory(retentionDays);
      }
    }

    invoiceSvc.clearTodayInvoices();
    invoiceSvc.resetCounter(today);

    if (autoClear) {
      patientSvc.pruneExpired(retentionDays);
      reportSvc.pruneExpired(retentionDays);
    }

    scopedStorage.set(TODAY_KEY, { date: today, counter: 0 });

    setIsNewDay(true);
    console.info(
      `[useDailyReset] [${scopedStorage.labId}] New day detected (${yesterday} → ${today}). Reset complete.`
    );
  }, [scopedStorage]);

  return { isNewDay };
}
