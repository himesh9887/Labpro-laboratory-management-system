/**
 * invoiceService.js
 * ─────────────────
 * All invoice CRUD, numbering, and archival logic.
 *
 * Keys used:
 *   labpro_invoices  — array of today's Invoice objects
 *   labpro_today     — { date: 'YYYY-MM-DD', counter: number }
 *   labpro_history   — { [date]: Invoice[] }
 */

import storageService from './storageService';

const INVOICES_KEY = 'invoices';
const TODAY_KEY    = 'today';
const HISTORY_KEY  = 'history';

/* ── helpers ─────────────────────────────────────────── */

function todayString() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function getTodayMeta() {
  return storageService.get(TODAY_KEY, { date: todayString(), counter: 0 });
}

function setTodayMeta(meta) {
  storageService.set(TODAY_KEY, meta);
}

/* ── public API ──────────────────────────────────────── */

const invoiceService = {
  /** Load today's invoices */
  loadInvoices() {
    return storageService.get(INVOICES_KEY, []);
  },

  /** Persist the full invoices array */
  saveInvoices(arr) {
    storageService.set(INVOICES_KEY, arr);
  },

  /**
   * Generate next invoice number and persist the counter.
   * Format: INV-000001, resets every new day.
   */
  getNextInvoiceNo() {
    const meta = getTodayMeta();
    const next = (meta.counter || 0) + 1;
    setTodayMeta({ ...meta, counter: next });
    return `INV-${String(next).padStart(6, '0')}`;
  },

  /**
   * Add a new invoice. Returns the saved invoice.
   */
  addInvoice(data) {
    const invoiceNo = this.getNextInvoiceNo();
    const newInvoice = {
      ...data,
      invoiceNo,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeline: [{ step: 'created', date: new Date().toISOString(), done: true }],
    };
    const invoices = this.loadInvoices();
    // Safety: never duplicate invoice numbers
    if (invoices.some(i => i.invoiceNo === invoiceNo)) {
      console.warn('[invoiceService] duplicate invoice number prevented:', invoiceNo);
      return null;
    }
    const updated = [newInvoice, ...invoices];
    this.saveInvoices(updated);
    return newInvoice;
  },

  /**
   * Delete an invoice by invoice number.
   */
  deleteInvoice(invoiceNo) {
    const invoices = this.loadInvoices();
    this.saveInvoices(invoices.filter(i => i.invoiceNo !== invoiceNo));
  },

  /**
   * Update the timeline of an invoice.
   */
  updateTimeline(invoiceNo, stepKey) {
    const invoices = this.loadInvoices();
    const updated = invoices.map(inv => {
      if (inv.invoiceNo !== invoiceNo) return inv;
      const tl = [...(inv.timeline || [])];
      if (!tl.find(t => t.step === stepKey)) {
        tl.push({ step: stepKey, date: new Date().toISOString(), done: true });
      } else {
        const idx = tl.findIndex(t => t.step === stepKey);
        tl[idx] = { ...tl[idx], done: true };
      }
      return { ...inv, timeline: tl };
    });
    this.saveInvoices(updated);
  },

  /**
   * Archive today's invoices into history under their date key.
   * Does NOT delete today's list — caller should decide that.
   */
  archiveToHistory(invoices, date) {
    if (!invoices || invoices.length === 0) return;
    const history = storageService.get(HISTORY_KEY, {});
    history[date] = [...(history[date] || []), ...invoices];
    storageService.set(HISTORY_KEY, history);
  },

  /** Load full history object { [date]: Invoice[] } */
  loadHistory() {
    return storageService.get(HISTORY_KEY, {});
  },

  /**
   * Clear today's invoice list (called on daily reset).
   */
  clearTodayInvoices() {
    storageService.set(INVOICES_KEY, []);
  },

  /**
   * Reset invoice counter for a new day.
   */
  resetCounter(date) {
    setTodayMeta({ date, counter: 0 });
  },

  /** Remove history entries older than retentionDays */
  pruneHistory(retentionDays) {
    if (!retentionDays) return; // 'Never delete'
    const history = storageService.get(HISTORY_KEY, {});
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const pruned = Object.fromEntries(
      Object.entries(history).filter(([date]) => date >= cutoffStr)
    );
    storageService.set(HISTORY_KEY, pruned);
  },

  /**
   * Load ALL invoices: today's active list + every archived historical record.
   * Used by the dashboard chart so it can show real data across multiple days.
   */
  loadAllInvoices() {
    const today = this.loadInvoices();
    const history = storageService.get(HISTORY_KEY, {});
    const archived = Object.values(history).flat();
    // Merge, deduplicate by invoiceNo (today's copy wins)
    const map = new Map();
    archived.forEach(inv => { if (inv.invoiceNo) map.set(inv.invoiceNo, inv); });
    today.forEach(inv => { if (inv.invoiceNo) map.set(inv.invoiceNo, inv); });
    return Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },
};

export default invoiceService;
