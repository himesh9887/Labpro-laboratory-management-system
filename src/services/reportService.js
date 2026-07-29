/**
 * reportService.js
 * ────────────────
 * CRUD for diagnostic report records with retention-based pruning.
 * Key: labpro_reports
 */

import storageService from './storageService';

const KEY = 'reports';

let reportCounter = 0; // in-memory, seeded from storage on first load

function getNextReportId(existing) {
  // Find highest existing RPT number so we never duplicate
  const max = existing.reduce((m, r) => {
    const num = parseInt((r.id || '').replace(/\D/g, '')) || 0;
    return num > m ? num : m;
  }, 0);
  reportCounter = max + 1;
  return `RPT-${String(Date.now()).slice(-6)}-${String(reportCounter).padStart(3, '0')}`;
}

const reportService = {
  loadReports() {
    return storageService.get(KEY, []);
  },

  saveReports(arr) {
    storageService.set(KEY, arr);
  },

  addReport(reportData) {
    const reports = this.loadReports();
    const report = {
      ...reportData,
      id: reportData.id || getNextReportId(reports),
      createdAt: reportData.createdAt || new Date().toISOString(),
      date: reportData.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    const updated = [report, ...reports];
    this.saveReports(updated);
    return report;
  },

  updateReport(id, patch) {
    const reports = this.loadReports();
    const updated = reports.map(r => r.id === id ? { ...r, ...patch } : r);
    this.saveReports(updated);
  },

  deleteReport(id) {
    const reports = this.loadReports();
    this.saveReports(reports.filter(r => r.id !== id));
  },

  /**
   * Remove reports older than retentionDays.
   */
  pruneExpired(retentionDays) {
    if (!retentionDays) return;
    const reports = this.loadReports();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    this.saveReports(reports.filter(r => {
      if (!r.createdAt) return true;
      return new Date(r.createdAt) >= cutoff;
    }));
  },

  /** Get only today's reports */
  getTodayReports() {
    const today = new Date().toISOString().slice(0, 10);
    return this.loadReports().filter(r =>
      r.createdAt && r.createdAt.slice(0, 10) === today
    );
  },
};

export default reportService;
