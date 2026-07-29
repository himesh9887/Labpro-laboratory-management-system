/**
 * useDashboardAnalytics.js
 * ────────────────────────
 * All dashboard analytics — pure functions + a single React hook.
 * Memoized: recalculates only when invoices/reports arrays change.
 *
 * Accepts:
 *   invoices    — today's invoices     (for today/filter stats)
 *   allInvoices — today + all history  (for 7-day chart)
 *   reports     — all reports
 *   preset      — 'today' | 'yesterday' | '7days' | '30days' | 'month' | 'custom'
 */

import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, parseISO, isValid } from 'date-fns';

/* ── helpers ───────────────────────────────────────────── */

export function toDateStr(iso) {
  try {
    const d = typeof iso === 'string' ? parseISO(iso) : iso;
    return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
  } catch {
    return null;
  }
}

export function inRange(createdAt, from, to) {
  const d = toDateStr(createdAt);
  if (!d) return false;
  return d >= from && d <= to;
}

/* ── date range presets ────────────────────────────────── */

export function getDateRange(preset, customFrom, customTo) {
  const today = format(new Date(), 'yyyy-MM-dd');
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'yesterday': {
      const y = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      return { from: y, to: y };
    }
    case '7days':
      return { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today };
    case '30days':
      return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
    case 'month': {
      const m = format(new Date(), 'yyyy-MM');
      return { from: `${m}-01`, to: today };
    }
    case 'custom':
      return { from: customFrom || today, to: customTo || today };
    default:
      return { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today };
  }
}

/* ── main stats ─────────────────────────────────────────── */

export function computeStats(invoices, reports, from, to) {
  const inv = invoices.filter(i => inRange(i.createdAt, from, to));
  const rpt = reports.filter(r => inRange(r.createdAt, from, to));

  // Invoice stats
  const totalRevenue    = inv.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalPaid       = totalRevenue;
  const totalDue        = inv.reduce((s, i) => s + (i.dueAmount || 0), 0);
  const paidInvoices    = inv.filter(i => (i.dueAmount || 0) === 0).length;
  const pendingInvoices = inv.filter(i => (i.dueAmount || 0) > 0).length;
  const avgInvoiceVal   = inv.length > 0 ? totalRevenue / inv.length : 0;

  // Report status breakdown
  const totalReports      = rpt.length;
  const completedReports  = rpt.filter(r => ['Final', 'Completed'].includes(r.status)).length;
  const pendingReports    = rpt.filter(r => ['Draft', 'Pending'].includes(r.status)).length;
  const inProgressReports = rpt.filter(r => ['In progress', 'Preliminary'].includes(r.status)).length;
  const verifiedReports   = rpt.filter(r => r.status === 'Verified').length;
  const draftReports      = rpt.filter(r => r.status === 'Draft').length;
  const printedReports    = rpt.filter(r => r.status === 'Printed').length;
  const deliveredReports  = rpt.filter(r => r.status === 'Delivered').length;

  // Tests from invoices
  const totalTests = inv.reduce((s, i) => s + (i.selectedTests?.length || 0), 0);

  // Days in range (for averages)
  const days = Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);

  return {
    invoiceCount: inv.length,
    totalRevenue, totalPaid, totalDue,
    paidInvoices, pendingInvoices, avgInvoiceVal,
    totalReports, completedReports, pendingReports,
    inProgressReports, verifiedReports, draftReports,
    printedReports, deliveredReports,
    totalTests,
    avgRevenuePerDay: totalRevenue / days,
    avgReportsPerDay: totalReports / days,
    avgTestsPerDay:   totalTests / days,
    recentInvoices:   invoices.slice(0, 10),
    recentReports:    reports.slice(0, 10),
  };
}

/* ── 7-day chart data (uses allInvoices for multi-day accuracy) ── */

export function computeChartData(allInvoices, reports, days = 7) {
  const today    = new Date();
  const interval = eachDayOfInterval({ start: subDays(today, days - 1), end: today });

  return interval.map(day => {
    const d          = format(day, 'yyyy-MM-dd');
    const dayInv     = allInvoices.filter(i => toDateStr(i.createdAt) === d);
    const dayRpt     = reports.filter(r => toDateStr(r.createdAt) === d);
    const revenue    = dayInv.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const tests      = dayInv.reduce((s, i) => s + (i.selectedTests?.length || 0), 0);

    return {
      day:      format(day, 'EEE'),
      date:     format(day, 'd MMM'),
      fullDate: d,
      reports:  dayRpt.length,
      revenue,
      invoices: dayInv.length,
      tests,
    };
  });
}

/* ── top N tests ───────────────────────────────────────── */

export function computeTopTests(invoices, limit = 5) {
  const counts = {};
  invoices.forEach(inv => {
    (inv.selectedTests || []).forEach(t => {
      const name = t.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
  });
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/* ── revenue by payment mode ───────────────────────────── */

export function computeRevenueByMode(invoices) {
  const modes = {};
  invoices.forEach(inv => {
    const mode = inv.paymentMode || 'Other';
    modes[mode] = (modes[mode] || 0) + (inv.paidAmount || 0);
  });
  const total = Object.values(modes).reduce((s, v) => s + v, 0);
  return Object.entries(modes)
    .map(([mode, amount]) => ({
      mode,
      amount,
      pct: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/* ── report status breakdown ───────────────────────────── */

const STATUS_META = {
  Draft:         { color: '#94a3b8', label: 'Draft' },
  Preliminary:   { color: '#60a5fa', label: 'Preliminary' },
  'In progress': { color: '#f59e0b', label: 'In Progress' },
  Final:         { color: '#10b981', label: 'Completed' },
  Completed:     { color: '#10b981', label: 'Completed' },
  Verified:      { color: '#6366f1', label: 'Verified' },
  Pending:       { color: '#f97316', label: 'Pending' },
  Printed:       { color: '#3b82f6', label: 'Printed' },
  Delivered:     { color: '#22c55e', label: 'Delivered' },
};

export function computeReportStatus(reports) {
  const counts = {};
  reports.forEach(r => {
    const key = r.status || 'Draft';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    color: STATUS_META[status]?.color || '#94a3b8',
    label: STATUS_META[status]?.label || status,
  }));
}

/* ── recent activity (from stored activity log) ────────── */

export function computeRecentActivity(activityLog, invoices, reports) {
  // If we have a persistent activity log, use it; otherwise synthesize from data
  if (activityLog && activityLog.length > 0) {
    return activityLog.slice(0, 20);
  }

  // Fallback: synthesize from existing invoices + reports
  const items = [
    ...invoices.slice(0, 15).map(i => ({
      id:        i.invoiceNo,
      icon:      '🧾',
      title:     'Invoice Created',
      detail:    `${i.invoiceNo} · ${i.patientName} · ₹${Number(i.grandTotal || 0).toLocaleString('en-IN')}`,
      status:    (i.dueAmount || 0) === 0 ? 'Paid' : 'Pending',
      timestamp: i.createdAt,
    })),
    ...reports.slice(0, 15).map(r => ({
      id:        r.id,
      icon:      '📋',
      title:     'Report Generated',
      detail:    `${r.id} · ${r.patient} · ${r.tests || ''}`,
      status:    r.status,
      timestamp: r.createdAt,
    })),
  ];
  return items
    .filter(i => i.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);
}

/* ── React hook ─────────────────────────────────────────── */

export function useDashboardAnalytics(
  invoices,
  allInvoices,
  reports,
  activityLog,
  preset     = '7days',
  customFrom = '',
  customTo   = '',
  topLimit   = 5
) {
  return useMemo(() => {
    const { from, to } = getDateRange(preset, customFrom, customTo);

    // Filtered slices for stats
    const filteredInvoices = allInvoices.filter(i => inRange(i.createdAt, from, to));
    const filteredReports  = reports.filter(r => inRange(r.createdAt, from, to));

    const stats          = computeStats(allInvoices, reports, from, to);
    const chartData      = computeChartData(allInvoices, reports, 7);
    const topTests       = computeTopTests(filteredInvoices, topLimit);
    const revenueByMode  = computeRevenueByMode(filteredInvoices);
    const reportStatus   = computeReportStatus(filteredReports);
    const recentActivity = computeRecentActivity(activityLog, invoices, reports);

    return {
      stats,
      chartData,
      topTests,
      revenueByMode,
      reportStatus,
      recentActivity,
      from,
      to,
    };
  }, [invoices, allInvoices, reports, activityLog, preset, customFrom, customTo, topLimit]);
}
