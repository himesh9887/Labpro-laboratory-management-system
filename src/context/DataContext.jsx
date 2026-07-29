/**
 * DataContext.jsx
 * ───────────────
 * Single React Context that owns ALL persisted application data.
 *
 * Exposes:
 *   invoices      — today's invoices (React state, auto-updates)
 *   allInvoices   — today + all history (for multi-day charts)
 *   patients      — all patients
 *   reports       — all reports
 *   settings      — app settings
 *   activityLog   — last 100 activity events (persistent)
 *   todayStats    — pre-computed daily metrics
 *
 * Every mutation (add/update/delete) automatically:
 *   1. Writes to localStorage via the service
 *   2. Updates the relevant React state array (reactive)
 *   3. Appends a timestamped event to activityLog
 *
 * Future-ready: swap service calls for API calls here without
 * touching any UI component.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import invoiceService  from '../services/invoiceService';
import patientService  from '../services/patientService';
import reportService   from '../services/reportService';
import settingsService from '../services/settingsService';
import storageService  from '../services/storageService';
import activityService, { EVENT_TYPES } from '../services/activityService';
import { useDailyReset } from '../hooks/useDailyReset';

const DataContext = createContext(null);

/* ─────────────────────────────────────────────────────── */

export function DataProvider({ children }) {
  // Run daily reset before loading data
  useDailyReset();

  // ── State ───────────────────────────────────────────────
  const [invoices,     setInvoices]     = useState(() => invoiceService.loadInvoices());
  const [allInvoices,  setAllInvoices]  = useState(() => invoiceService.loadAllInvoices());
  const [patients,     setPatients]     = useState(() => patientService.loadPatients());
  const [reports,      setReports]      = useState(() => reportService.loadReports());
  const [settings,     setSettings]     = useState(() => settingsService.getSettings());
  const [activityLog,  setActivityLog]  = useState(() => activityService.loadLog());

  // Re-sync from storage after daily reset fires
  useEffect(() => {
    setInvoices(invoiceService.loadInvoices());
    setAllInvoices(invoiceService.loadAllInvoices());
    setPatients(patientService.loadPatients());
    setReports(reportService.loadReports());
    setActivityLog(activityService.loadLog());
  }, []); // intentionally once, post-reset

  /* ── helper: add activity event and update state ─────── */
  const logActivity = useCallback((type, title, detail = '') => {
    activityService.addEvent(type, title, detail);
    setActivityLog(activityService.loadLog());
  }, []);

  /* ── helper: sync all invoice states ────────────────── */
  const syncInvoices = useCallback(() => {
    setInvoices(invoiceService.loadInvoices());
    setAllInvoices(invoiceService.loadAllInvoices());
  }, []);

  // ── Invoice actions ─────────────────────────────────────
  const addInvoice = useCallback((data) => {
    const inv = invoiceService.addInvoice(data);
    if (inv) {
      syncInvoices();
      logActivity(
        EVENT_TYPES.INVOICE_CREATED,
        'Invoice Created',
        `${inv.invoiceNo} · ${inv.patientName} · ₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}`
      );
      // Also log payment if fully paid
      if ((inv.dueAmount || 0) === 0 && (inv.paidAmount || 0) > 0) {
        logActivity(
          EVENT_TYPES.PAYMENT_RECEIVED,
          'Payment Received',
          `${inv.invoiceNo} · ₹${Number(inv.paidAmount || 0).toLocaleString('en-IN')} via ${inv.paymentMode}`
        );
      }
    }
    return inv;
  }, [syncInvoices, logActivity]);

  const deleteInvoice = useCallback((invoiceNo) => {
    const inv = invoiceService.loadInvoices().find(i => i.invoiceNo === invoiceNo);
    invoiceService.deleteInvoice(invoiceNo);
    syncInvoices();
    logActivity(
      EVENT_TYPES.INVOICE_DELETED,
      'Invoice Deleted',
      `${invoiceNo}${inv ? ` · ${inv.patientName}` : ''}`
    );
  }, [syncInvoices, logActivity]);

  const updateTimeline = useCallback((invoiceNo, stepKey) => {
    const label = stepKey.charAt(0).toUpperCase() + stepKey.slice(1);
    invoiceService.updateTimeline(invoiceNo, stepKey);
    syncInvoices();
    logActivity(
      EVENT_TYPES.TIMELINE_UPDATED,
      `Status: ${label}`,
      `Invoice ${invoiceNo} → ${stepKey}`
    );
  }, [syncInvoices, logActivity]);

  // ── Patient actions ─────────────────────────────────────
  const addPatient = useCallback((patient) => {
    const p = patientService.addPatient(patient);
    setPatients(patientService.loadPatients());
    logActivity(
      EVENT_TYPES.PATIENT_REGISTERED,
      'Patient Registered',
      `${p.name}${p.phone ? ` · ${p.phone}` : ''}`
    );
    return p;
  }, [logActivity]);

  const updatePatient = useCallback((id, patch) => {
    patientService.updatePatient(id, patch);
    setPatients(patientService.loadPatients());
  }, []);

  const deletePatient = useCallback((id) => {
    patientService.deletePatient(id);
    setPatients(patientService.loadPatients());
  }, []);

  // ── Report actions ──────────────────────────────────────
  const addReport = useCallback((data) => {
    const r = reportService.addReport(data);
    setReports(reportService.loadReports());
    logActivity(
      EVENT_TYPES.REPORT_CREATED,
      'Report Generated',
      `${r.id} · ${r.patient}${r.tests ? ` · ${r.tests}` : ''}`
    );
    return r;
  }, [logActivity]);

  const updateReport = useCallback((id, patch) => {
    reportService.updateReport(id, patch);
    setReports(reportService.loadReports());
    // Log status-specific events
    if (patch.status) {
      const statusEvents = {
        Verified: [EVENT_TYPES.REPORT_VERIFIED, 'Report Verified'],
        Final:    [EVENT_TYPES.REPORT_UPDATED,  'Report Finalised'],
        Printed:  [EVENT_TYPES.REPORT_PRINTED,  'Report Printed'],
        Delivered:[EVENT_TYPES.REPORT_DELIVERED,'Report Delivered'],
      };
      const [type, title] = statusEvents[patch.status] || [EVENT_TYPES.REPORT_UPDATED, 'Report Updated'];
      logActivity(type, title, `Report ${id} → ${patch.status}`);
    } else {
      logActivity(EVENT_TYPES.REPORT_UPDATED, 'Report Updated', `Report ${id}`);
    }
  }, [logActivity]);

  const deleteReport = useCallback((id) => {
    reportService.deleteReport(id);
    setReports(reportService.loadReports());
    logActivity(EVENT_TYPES.REPORT_DELETED, 'Report Deleted', `Report ${id}`);
  }, [logActivity]);

  // ── Settings ────────────────────────────────────────────
  const updateSettings = useCallback((patch) => {
    const updated = settingsService.saveSettings(patch);
    setSettings(updated);
    return updated;
  }, []);

  // ── Manual controls ─────────────────────────────────────
  const clearTodayData = useCallback(() => {
    invoiceService.clearTodayInvoices();
    invoiceService.resetCounter(new Date().toISOString().slice(0, 10));
    setInvoices([]);
    setAllInvoices(invoiceService.loadAllInvoices());
    logActivity(EVENT_TYPES.SETTINGS_SAVED, "Today's Data Cleared", '');
  }, [logActivity]);

  const clearAllData = useCallback(() => {
    storageService.clearAll();
    setInvoices([]);
    setAllInvoices([]);
    setPatients([]);
    setReports([]);
    setSettings(settingsService.getSettings());
    setActivityLog([]);
  }, []);

  const exportData = useCallback(() => storageService.exportAll(), []);

  const importData = useCallback((jsonData) => {
    storageService.importAll(jsonData);
    setInvoices(invoiceService.loadInvoices());
    setAllInvoices(invoiceService.loadAllInvoices());
    setPatients(patientService.loadPatients());
    setReports(reportService.loadReports());
    setSettings(settingsService.getSettings());
    setActivityLog(activityService.loadLog());
  }, []);

  const loadHistory = useCallback(() => invoiceService.loadHistory(), []);

  // ── Today stats ─────────────────────────────────────────
  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayInvoices = invoices.filter(i =>
      i.createdAt && i.createdAt.slice(0, 10) === todayStr
    );
    const todayReports = reports.filter(r =>
      r.createdAt && r.createdAt.slice(0, 10) === todayStr
    );
    const todayPatients = patients.filter(p =>
      p.createdAt && p.createdAt.slice(0, 10) === todayStr
    );

    const revenue       = todayInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const totalPaid     = revenue;
    const totalDue      = todayInvoices.reduce((s, i) => s + (i.dueAmount || 0), 0);
    const paidCount     = todayInvoices.filter(i => (i.dueAmount || 0) === 0).length;
    const pendingCount  = todayInvoices.filter(i => (i.dueAmount || 0) > 0).length;
    const avgInvoiceVal = todayInvoices.length > 0 ? revenue / todayInvoices.length : 0;

    // All test counts from today's invoices
    const totalTests = todayInvoices.reduce((s, i) => s + (i.selectedTests?.length || 0), 0);

    // Most performed test
    const testCounts = {};
    todayInvoices.forEach(inv => {
      (inv.selectedTests || []).forEach(t => {
        const name = t.name || 'Unknown';
        testCounts[name] = (testCounts[name] || 0) + 1;
      });
    });
    const mostPerformedTest = Object.entries(testCounts)
      .sort(([, a], [, b]) => b - a)[0];

    const completedReports  = todayReports.filter(r => ['Final', 'Completed'].includes(r.status)).length;
    const pendingReports    = todayReports.filter(r => ['Draft', 'Pending'].includes(r.status)).length;
    const inProgressReports = todayReports.filter(r => r.status === 'In progress' || r.status === 'Preliminary').length;
    const verifiedReports   = todayReports.filter(r => r.status === 'Verified').length;
    const draftReports      = todayReports.filter(r => r.status === 'Draft').length;
    const printedReports    = todayReports.filter(r => r.status === 'Printed').length;
    const deliveredReports  = todayReports.filter(r => r.status === 'Delivered').length;

    return {
      revenue,
      totalPaid,
      totalDue,
      pending: totalDue,
      invoiceCount: todayInvoices.length,
      paidCount,
      pendingCount,
      avgInvoiceVal,
      totalTests,
      mostPerformedTest: mostPerformedTest
        ? `${mostPerformedTest[0]} (${mostPerformedTest[1]})`
        : '—',
      reportCount: todayReports.length,
      completedReports,
      pendingReports,
      inProgressReports,
      verifiedReports,
      draftReports,
      printedReports,
      deliveredReports,
      patientCount: todayPatients.length,
      recentInvoices: invoices.slice(0, 10),
      recentReports:  reports.slice(0, 10),
    };
  }, [invoices, patients, reports]);

  // ── History ─────────────────────────────────────────────
  const value = {
    // Data
    invoices,
    allInvoices,
    patients,
    reports,
    settings,
    activityLog,
    todayStats,

    // Invoice actions
    addInvoice,
    deleteInvoice,
    updateTimeline,

    // Patient actions
    addPatient,
    updatePatient,
    deletePatient,

    // Report actions
    addReport,
    updateReport,
    deleteReport,

    // Settings
    updateSettings,

    // Manual controls
    clearTodayData,
    clearAllData,
    exportData,
    importData,
    loadHistory,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
