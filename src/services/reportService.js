/**
 * reportService.js
 * ────────────────
 * CRUD for diagnostic report records with retention-based pruning.
 * Factory: call createReportService(scopedStorage) for a lab-scoped instance.
 * Key: reports
 */

export function createReportService(storage) {
  const KEY = 'reports';

  function getNextReportId(existing) {
    const max = existing.reduce((m, r) => {
      const num = parseInt((r.id || '').replace(/\D/g, '')) || 0;
      return num > m ? num : m;
    }, 0);
    const counter = max + 1;
    return `RPT-${String(Date.now()).slice(-6)}-${String(counter).padStart(3, '0')}`;
  }

  return {
    loadReports() {
      return storage.get(KEY, []);
    },

    saveReports(arr) {
      storage.set(KEY, arr);
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

    getTodayReports() {
      const today = new Date().toISOString().slice(0, 10);
      return this.loadReports().filter(r =>
        r.createdAt && r.createdAt.slice(0, 10) === today
      );
    },
  };
}

/* ── Legacy singleton (do NOT use for new code) ──────── */
import storageService from './storageService';
const _legacy = createReportService(storageService);
export default _legacy;
