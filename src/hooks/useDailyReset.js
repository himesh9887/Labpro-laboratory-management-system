/**
 * useDailyReset.js
 * ────────────────
 * Runs once at app startup. Compares the stored date with today.
 * If the date has changed, triggers the daily reset sequence:
 *   1. Archive yesterday's invoices (if keepHistory)
 *   2. Prune expired patients and reports (if autoClear)
 *   3. Reset invoice counter
 *   4. Write today's date to labpro_today
 *
 * Returns { isNewDay } so callers can react if needed.
 */

import { useEffect, useRef, useState } from 'react';
import storageService   from '../services/storageService';
import invoiceService   from '../services/invoiceService';
import patientService   from '../services/patientService';
import reportService    from '../services/reportService';
import settingsService  from '../services/settingsService';

const TODAY_KEY = 'today';

function currentDateStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

export function useDailyReset() {
  const [isNewDay, setIsNewDay] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const today = currentDateStr();
    const meta  = storageService.get(TODAY_KEY, { date: null, counter: 0 });

    if (meta.date === today) {
      // Same day — nothing to do
      return;
    }

    // ─── Daily Reset ──────────────────────────────────────
    const { keepHistory, autoClear, retentionDays } = settingsService.getSettings();
    const yesterday = meta.date;

    if (yesterday) {
      if (keepHistory) {
        // Archive yesterday's invoices before wiping them
        const oldInvoices = invoiceService.loadInvoices();
        invoiceService.archiveToHistory(oldInvoices, yesterday);
        invoiceService.pruneHistory(retentionDays);
      }
    }

    // Clear today's invoice list for the new day
    invoiceService.clearTodayInvoices();
    invoiceService.resetCounter(today);

    if (autoClear) {
      patientService.pruneExpired(retentionDays);
      reportService.pruneExpired(retentionDays);
    }

    // Write the new date
    storageService.set(TODAY_KEY, { date: today, counter: 0 });

    setIsNewDay(true);
    console.info(`[useDailyReset] New day detected (${yesterday} → ${today}). Daily reset complete.`);
  }, []);

  return { isNewDay };
}
