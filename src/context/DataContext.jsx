/**
 * DataContext.jsx
 * ───────────────
 * Single React Context that owns ALL persisted application data.
 *
 * MULTI-LAB ISOLATION:
 *   All services are created as factory instances bound to the current
 *   lab's scopedStorage (e.g. labpro_LAB001_invoices). Data from one
 *   lab NEVER leaks into another.
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
 *   1. Writes to lab-scoped localStorage via the service
 *   2. Updates the relevant React state array (reactive)
 *   3. Appends a timestamped event to activityLog
 *
 * Future-ready: swap service factory calls for API calls here without
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

import { createInvoiceService }  from '../services/invoiceService';
import { createPatientService }  from '../services/patientService';
import { createReportService }   from '../services/reportService';
import { createSettingsService } from '../services/settingsService';
import { createActivityService, EVENT_TYPES } from '../services/activityService';
import { useDailyReset }         from '../hooks/useDailyReset';
import { useAuth }               from './AuthContext';

const DataContext = createContext(null);

/* ─────────────────────────────────────────────────────── */

export function DataProvider({ children }) {
  const { scopedStorage, labId, isAuthenticated } = useAuth();

  // ── Build scoped service instances ──────────────────────
  // These are recreated whenever the logged-in lab changes.
  const invoiceSvc  = useMemo(() => scopedStorage ? createInvoiceService(scopedStorage)  : null, [scopedStorage]);
  const patientSvc  = useMemo(() => scopedStorage ? createPatientService(scopedStorage)  : null, [scopedStorage]);
  const reportSvc   = useMemo(() => scopedStorage ? createReportService(scopedStorage)   : null, [scopedStorage]);
  const settingsSvc = useMemo(() => scopedStorage ? createSettingsService(scopedStorage) : null, [scopedStorage]);
  const activitySvc = useMemo(() => scopedStorage ? createActivityService(scopedStorage) : null, [scopedStorage]);
  // draftSvc is exposed via useDraft hook directly — not needed here

  // Run daily reset before loading data (passes current scopedStorage)
  useDailyReset(scopedStorage);

  // ── State ───────────────────────────────────────────────
  const [invoices,    setInvoices]    = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [patients,    setPatients]    = useState([]);
  const [reports,     setReports]     = useState([]);
  const [settings,    setSettings]    = useState({});
  const [activityLog, setActivityLog] = useState([]);

  // ── Re-load all data when lab changes (login/logout) ────
  useEffect(() => {
    if (!isAuthenticated || !invoiceSvc) {
      setInvoices([]);
      setAllInvoices([]);
      setPatients([]);
      setReports([]);
      setSettings({});
      setActivityLog([]);
      return;
    }
    setInvoices(invoiceSvc.loadInvoices());
    setAllInvoices(invoiceSvc.loadAllInvoices());
    setPatients(patientSvc.loadPatients());
    setReports(reportSvc.loadReports());
    setSettings(settingsSvc.getSettings());
    setActivityLog(activitySvc.loadLog());
  }, [labId, isAuthenticated, invoiceSvc, patientSvc, reportSvc, settingsSvc, activitySvc]);

  /* ── helper: add activity event and update state ─────── */
  const logActivity = useCallback((type, title, detail = '') => {
    if (!activitySvc) return;
    activitySvc.addEvent(type, title, detail);
    setActivityLog(activitySvc.loadLog());
  }, [activitySvc]);

  /* ── helper: sync all invoice states ────────────────── */
  const syncInvoices = useCallback(() => {
    if (!invoiceSvc) return;
    setInvoices(invoiceSvc.loadInvoices());
    setAllInvoices(invoiceSvc.loadAllInvoices());
  }, [invoiceSvc]);

  // ── Invoice actions ─────────────────────────────────────
  const addInvoice = useCallback((data) => {
    if (!invoiceSvc) return null;
    const inv = invoiceSvc.addInvoice(data);
    if (inv) {
      syncInvoices();
      logActivity(
        EVENT_TYPES.INVOICE_CREATED,
        'Invoice Created',
        `${inv.invoiceNo} · ${inv.patientName} · ₹${Number(inv.grandTotal || 0).toLocaleString('en-IN')}`
      );
      if ((inv.dueAmount || 0) === 0 && (inv.paidAmount || 0) > 0) {
        logActivity(
          EVENT_TYPES.PAYMENT_RECEIVED,
          'Payment Received',
          `${inv.invoiceNo} · ₹${Number(inv.paidAmount || 0).toLocaleString('en-IN')} via ${inv.paymentMode}`
        );
      }
    }
    return inv;
  }, [invoiceSvc, syncInvoices, logActivity]);

  const deleteInvoice = useCallback((invoiceNo) => {
    if (!invoiceSvc) return;
    const inv = invoiceSvc.loadInvoices().find(i => i.invoiceNo === invoiceNo);
    invoiceSvc.deleteInvoice(invoiceNo);
    syncInvoices();
    logActivity(
      EVENT_TYPES.INVOICE_DELETED,
      'Invoice Deleted',
      `${invoiceNo}${inv ? ` · ${inv.patientName}` : ''}`
    );
  }, [invoiceSvc, syncInvoices, logActivity]);

  const updateTimeline = useCallback((invoiceNo, stepKey) => {
    if (!invoiceSvc) return;
    const label = stepKey.charAt(0).toUpperCase() + stepKey.slice(1);
    invoiceSvc.updateTimeline(invoiceNo, stepKey);
    syncInvoices();
    logActivity(
      EVENT_TYPES.TIMELINE_UPDATED,
      `Status: ${label}`,
      `Invoice ${invoiceNo} → ${stepKey}`
    );
  }, [invoiceSvc, syncInvoices, logActivity]);

  // ── Patient actions ─────────────────────────────────────
  const addPatient = useCallback((patient) => {
    if (!patientSvc) return null;
    const p = patientSvc.addPatient(patient);
    setPatients(patientSvc.loadPatients());
    logActivity(
      EVENT_TYPES.PATIENT_REGISTERED,
      'Patient Registered',
      `${p.name}${p.phone ? ` · ${p.phone}` : ''}`
    );
    return p;
  }, [patientSvc, logActivity]);

  const updatePatient = useCallback((id, patch) => {
    if (!patientSvc) return;
    patientSvc.updatePatient(id, patch);
    setPatients(patientSvc.loadPatients());
  }, [patientSvc]);

  const deletePatient = useCallback((id) => {
    if (!patientSvc) return;
    patientSvc.deletePatient(id);
    setPatients(patientSvc.loadPatients());
  }, [patientSvc]);

  // ── Report actions ──────────────────────────────────────
  const addReport = useCallback((data) => {
    if (!reportSvc) return null;
    const r = reportSvc.addReport(data);
    setReports(reportSvc.loadReports());
    logActivity(
      EVENT_TYPES.REPORT_CREATED,
      'Report Generated',
      `${r.id} · ${r.patient}${r.tests ? ` · ${r.tests}` : ''}`
    );
    return r;
  }, [reportSvc, logActivity]);

  const updateReport = useCallback((id, patch) => {
    if (!reportSvc) return;
    reportSvc.updateReport(id, patch);
    setReports(reportSvc.loadReports());
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
  }, [reportSvc, logActivity]);

  const deleteReport = useCallback((id) => {
    if (!reportSvc) return;
    reportSvc.deleteReport(id);
    setReports(reportSvc.loadReports());
    logActivity(EVENT_TYPES.REPORT_DELETED, 'Report Deleted', `Report ${id}`);
  }, [reportSvc, logActivity]);

  // ── Settings ────────────────────────────────────────────
  const updateSettings = useCallback((patch) => {
    if (!settingsSvc) return {};
    const updated = settingsSvc.saveSettings(patch);
    setSettings(updated);
    return updated;
  }, [settingsSvc]);

  // ── Manual controls ─────────────────────────────────────
  const clearTodayData = useCallback(() => {
    if (!invoiceSvc) return;
    invoiceSvc.clearTodayInvoices();
    invoiceSvc.resetCounter(new Date().toISOString().slice(0, 10));
    setInvoices([]);
    setAllInvoices(invoiceSvc.loadAllInvoices());
    logActivity(EVENT_TYPES.SETTINGS_SAVED, "Today's Data Cleared", '');
  }, [invoiceSvc, logActivity]);

  const clearAllData = useCallback(() => {
    if (!scopedStorage) return;
    scopedStorage.clearAll();
    setInvoices([]);
    setAllInvoices([]);
    setPatients([]);
    setReports([]);
    setSettings(settingsSvc ? settingsSvc.getSettings() : {});
    setActivityLog([]);
  }, [scopedStorage, settingsSvc]);

  const exportData = useCallback(() => {
    if (!scopedStorage) return {};
    return scopedStorage.exportAll();
  }, [scopedStorage]);

  const importData = useCallback((jsonData) => {
    if (!scopedStorage) return;
    scopedStorage.importAll(jsonData);
    if (!invoiceSvc || !patientSvc || !reportSvc || !settingsSvc || !activitySvc) return;
    setInvoices(invoiceSvc.loadInvoices());
    setAllInvoices(invoiceSvc.loadAllInvoices());
    setPatients(patientSvc.loadPatients());
    setReports(reportSvc.loadReports());
    setSettings(settingsSvc.getSettings());
    setActivityLog(activitySvc.loadLog());
  }, [scopedStorage, invoiceSvc, patientSvc, reportSvc, settingsSvc, activitySvc]);

  const loadHistory = useCallback(() => {
    if (!invoiceSvc) return {};
    return invoiceSvc.loadHistory();
  }, [invoiceSvc]);

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

    const totalTests = todayInvoices.reduce((s, i) => s + (i.selectedTests?.length || 0), 0);

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

  // ── Context value ────────────────────────────────────────
  const value = {
    // Data
    invoices,
    allInvoices,
    patients,
    reports,
    settings,
    activityLog,
    todayStats,

    // Service instances (for hooks like useDraft)
    invoiceSvc,
    patientSvc,
    reportSvc,
    settingsSvc,
    activitySvc,

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
