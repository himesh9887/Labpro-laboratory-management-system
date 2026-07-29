/**
 * DashboardPage.jsx
 * ─────────────────
 * Fully real-time LIMS dashboard.
 * Every widget reads from DataContext (React state backed by localStorage).
 * Any mutation in the app (invoice/report/test CRUD) instantly re-renders
 * the relevant section — no polling, no manual refresh.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiAlertCircle, FiArrowRight, FiBarChart2,
  FiCheckCircle, FiClock, FiDollarSign, FiFilePlus,
  FiFileText, FiSearch, FiTrendingUp, FiUsers, FiZap,
  FiCalendar, FiPackage,
} from 'react-icons/fi';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import PageHeader           from '../components/common/PageHeader';
import MetricCard           from '../components/dashboard/MetricCard';
import StatusBadge          from '../components/common/StatusBadge';
import { useData }          from '../context/DataContext';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { useClock }         from '../hooks/useClock';

/* ── constants ─────────────────────────────────────────── */

const CHART_METRICS = [
  { key: 'reports',  label: 'Reports',  color: '#6366f1', grad: 'gradViolet' },
  { key: 'revenue',  label: 'Revenue',  color: '#2563eb', grad: 'gradBlue'   },
  { key: 'invoices', label: 'Invoices', color: '#10b981', grad: 'gradGreen'  },
  { key: 'tests',    label: 'Tests',    color: '#f59e0b', grad: 'gradAmber'  },
];

const PRESET_OPTS = [
  { key: 'today',     label: 'Today'      },
  { key: 'yesterday', label: 'Yesterday'  },
  { key: '7days',     label: 'Last 7 Days'},
  { key: '30days',    label: 'Last 30 Days'},
  { key: 'month',     label: 'This Month' },
];

const MODE_COLORS = {
  Cash: '#10b981', UPI: '#6366f1', Card: '#2563eb',
  'Bank Transfer': '#f59e0b', Credit: '#f43f5e', Other: '#94a3b8',
};

const LAB_SUMMARY_ITEMS = (ts) => [
  { label: 'Patients Registered', value: ts.patientCount,             color: 'text-blue-600 dark:text-blue-400'   },
  { label: 'Tests Performed',     value: ts.totalTests,               color: 'text-violet-600 dark:text-violet-400'},
  { label: 'Reports Generated',   value: ts.reportCount,              color: 'text-indigo-600 dark:text-indigo-400'},
  { label: 'Reports Verified',    value: ts.verifiedReports,          color: 'text-emerald-600 dark:text-emerald-400'},
  { label: 'Reports Printed',     value: ts.printedReports,           color: 'text-teal-600 dark:text-teal-400'   },
  { label: 'Revenue',             value: fmt(ts.revenue),             color: 'text-blue-700 dark:text-blue-300'   },
  { label: 'Pending Payments',    value: fmt(ts.pending),             color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Most Performed Test', value: ts.mostPerformedTest || '—', color: 'text-rose-600 dark:text-rose-400'   },
];

/* ── helpers ─────────────────────────────────────────────── */

function fmt(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 5)    return 'just now';
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  try { return format(new Date(isoStr), 'd MMM, HH:mm'); } catch { return ''; }
}

function exactTime(isoStr) {
  if (!isoStr) return '';
  try { return format(new Date(isoStr), 'd MMM yyyy, hh:mm a'); } catch { return ''; }
}

/* ── sub-components ─────────────────────────────────────── */

function SectionCard({ title, action, children, className = '' }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ icon: Icon, msg, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
        <Icon size={22} />
      </span>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{msg}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function ChartTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {payload[0]?.payload?.date}
      </p>
      <p className="font-mono font-bold text-slate-900 dark:text-white">
        {metric === 'revenue' ? fmt(val) : val}
      </p>
    </div>
  );
}

/* ── Live Clock widget ──────────────────────────────────── */
function ClockWidget({ clock }) {
  return (
    <div className="card px-5 py-4 flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
          <FiCalendar size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {clock.dayStr}
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {clock.dateStr}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white leading-none">
          {clock.timeStr}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{clock.monthStr}</p>
      </div>
    </div>
  );
}

/* ── Today's Lab Summary strip ──────────────────────────── */
function LabSummaryStrip({ items }) {
  return (
    <div className="card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Today's Lab Summary
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {items.map(item => (
          <div key={item.label} className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.label}</p>
            <p className={`text-sm font-bold font-mono ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Global Search ──────────────────────────────────────── */
function GlobalSearch({ invoices, reports, patients }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const ql = q.toLowerCase();
    const r = [
      ...invoices.slice(0, 50).filter(i =>
        `${i.invoiceNo} ${i.patientName} ${i.phone}`.toLowerCase().includes(ql)
      ).map(i => ({ type: 'Invoice', id: i.invoiceNo, label: i.patientName, sub: `${i.invoiceNo} · ${fmt(i.grandTotal)}`, link: '/invoice' })),
      ...reports.slice(0, 50).filter(r =>
        `${r.id} ${r.patient} ${r.tests}`.toLowerCase().includes(ql)
      ).map(r => ({ type: 'Report', id: r.id, label: r.patient, sub: `${r.id} · ${r.status}`, link: '/reports' })),
      ...patients.slice(0, 50).filter(p =>
        `${p.name} ${p.phone} ${p.id}`.toLowerCase().includes(ql)
      ).map(p => ({ type: 'Patient', id: p.id, label: p.name, sub: `${p.id} · ${p.phone || '—'}`, link: '/patients' })),
    ].slice(0, 8);
    return r;
  }, [q, invoices, reports, patients]);

  return (
    <div className="relative w-full max-w-sm">
      <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={15} />
      <input
        className="field pl-9 py-2 text-sm"
        placeholder="Search invoices, reports, patients…"
        value={q}
        onChange={e => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setQ(''), 200)}
      />
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
          >
            {results.map((r, i) => (
              <Link
                key={i}
                to={r.link}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  r.type === 'Invoice' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  r.type === 'Report'  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>{r.type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{r.label}</p>
                  <p className="text-xs text-slate-400 truncate">{r.sub}</p>
                </div>
                <FiArrowRight size={13} className="text-slate-300 shrink-0" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN PAGE                                              */
/* ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { invoices, allInvoices, reports, patients, activityLog, todayStats } = useData();
  const clock = useClock();

  const [preset,      setPreset]      = useState('today');
  const [customFrom,  setCustomFrom]  = useState('');
  const [customTo,    setCustomTo]    = useState('');
  const [chartMetric, setChartMetric] = useState('reports');
  const [topLimit,    setTopLimit]    = useState(5);

  const {
    stats,
    chartData,
    topTests,
    revenueByMode,
    reportStatus,
    recentActivity,
  } = useDashboardAnalytics(
    invoices, allInvoices, reports, activityLog,
    preset, customFrom, customTo, topLimit
  );

  const activeMetric = CHART_METRICS.find(m => m.key === chartMetric) || CHART_METRICS[0];
  const summaryItems = LAB_SUMMARY_ITEMS(todayStats);

  return (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <PageHeader
        title={`${clock.greeting}, Dr. Menon`}
        description={`${clock.dayStr}, ${clock.dateStr} · Real-time laboratory operations overview`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <GlobalSearch invoices={allInvoices} reports={reports} patients={patients} />
            <Link to="/reports/create" className="btn-primary shrink-0">
              <FiFilePlus size={15} /> New Report
            </Link>
          </div>
        }
      />

      {/* ── Clock + Lab Summary ─────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-3">
        <ClockWidget clock={clock} />
        <div className="xl:col-span-2">
          <LabSummaryStrip items={summaryItems} />
        </div>
      </div>

      {/* ── Date Range Filter ───────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">Range:</span>
        {PRESET_OPTS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors border ${
              preset === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
        {/* Custom range */}
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="date"
            value={customFrom}
            onChange={e => { setCustomFrom(e.target.value); setPreset('custom'); }}
            className="field py-1.5 text-xs"
            style={{ maxWidth: 140 }}
          />
          <span className="text-xs text-slate-400">–</span>
          <input
            type="date"
            value={customTo}
            onChange={e => { setCustomTo(e.target.value); setPreset('custom'); }}
            className="field py-1.5 text-xs"
            style={{ maxWidth: 140 }}
          />
        </div>
      </div>

      {/* ── 6 Metric Cards ──────────────────────────────── */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Reports"
          value={String(stats.totalReports)}
          trend={`${stats.completedReports} completed · ${stats.pendingReports} pending`}
          icon={FiFileText}
          tone="violet"
          breakdown={[
            { label: 'Draft',       value: stats.draftReports,      color: '#94a3b8' },
            { label: 'In Progress', value: stats.inProgressReports, color: '#f59e0b' },
            { label: 'Verified',    value: stats.verifiedReports,   color: '#6366f1' },
            { label: 'Printed',     value: stats.printedReports,    color: '#3b82f6' },
            { label: 'Delivered',   value: stats.deliveredReports,  color: '#22c55e' },
          ]}
        />
        <MetricCard
          label="Revenue"
          value={fmt(stats.totalRevenue)}
          trend={`Avg ${fmt(stats.avgInvoiceVal)} per invoice`}
          icon={FiDollarSign}
          tone="blue"
          breakdown={[
            { label: 'Total Paid', value: fmt(stats.totalPaid), color: '#10b981' },
            { label: 'Total Due',  value: fmt(stats.totalDue),  color: '#f43f5e' },
          ]}
        />
        <MetricCard
          label="Invoices"
          value={String(stats.invoiceCount)}
          trend={`${stats.paidInvoices} paid · ${stats.pendingInvoices} pending`}
          icon={FiTrendingUp}
          tone="green"
          breakdown={[
            { label: 'Paid',    value: stats.paidInvoices,    color: '#10b981' },
            { label: 'Pending', value: stats.pendingInvoices, color: '#f59e0b' },
          ]}
        />
        <MetricCard
          label="Pending Reports"
          value={String(stats.pendingReports)}
          trend={`${stats.inProgressReports} in progress · ${stats.draftReports} draft`}
          icon={FiClock}
          tone="amber"
          breakdown={[
            { label: 'Draft',       value: stats.draftReports,      color: '#94a3b8' },
            { label: 'In Progress', value: stats.inProgressReports, color: '#f59e0b' },
          ]}
        />
        <MetricCard
          label="Completed Reports"
          value={String(stats.completedReports)}
          trend={
            stats.totalReports > 0
              ? `${Math.round((stats.completedReports / stats.totalReports) * 100)}% completion rate`
              : 'No reports yet'
          }
          icon={FiCheckCircle}
          tone="green"
          breakdown={[
            { label: 'Verified',  value: stats.verifiedReports,  color: '#6366f1' },
            { label: 'Printed',   value: stats.printedReports,   color: '#3b82f6' },
            { label: 'Delivered', value: stats.deliveredReports, color: '#22c55e' },
          ]}
        />
        <MetricCard
          label="Pending Payments"
          value={fmt(stats.totalDue)}
          trend={`${stats.pendingInvoices} invoices unpaid`}
          icon={FiAlertCircle}
          tone="rose"
          breakdown={[
            { label: 'Invoices', value: stats.pendingInvoices,  color: '#f43f5e' },
            { label: 'Amount',   value: fmt(stats.totalDue),    color: '#f97316' },
          ]}
        />
      </div>

      {/* ── Chart + Quick Actions ────────────────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-5">

        {/* Area Chart */}
        <section className="card p-5 xl:col-span-3">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {activeMetric.label} — Last 7 Days
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Daily breakdown · auto-updates</p>
            </div>
            <select
              value={chartMetric}
              onChange={e => setChartMetric(e.target.value)}
              className="field py-1.5 text-xs"
              style={{ width: 'auto', minWidth: 110 }}
            >
              {CHART_METRICS.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          {chartData.every(d => (d[chartMetric] || 0) === 0) ? (
            <EmptyState icon={FiBarChart2} msg="No data yet" sub="Create invoices or reports to see the chart" />
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      {CHART_METRICS.map(m => (
                        <linearGradient key={m.grad} id={m.grad} x1="0" x2="0" y1="0" y2="1">
                          <stop stopColor={m.color} stopOpacity=".22" />
                          <stop offset="1" stopColor={m.color} stopOpacity="0" />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800 opacity-60" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-slate-500 dark:text-slate-400"
                      tickFormatter={chartMetric === 'revenue' ? v => `₹${(v / 1000).toFixed(0)}k` : undefined}
                      width={chartMetric === 'revenue' ? 50 : 30}
                    />
                    <Tooltip content={<ChartTooltip metric={chartMetric} />} cursor={{ stroke: activeMetric.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      dataKey={chartMetric}
                      stroke={activeMetric.color}
                      strokeWidth={2.5}
                      fill={`url(#${activeMetric.grad})`}
                      dot={{ r: 4, fill: activeMetric.color, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: activeMetric.color, stroke: '#fff', strokeWidth: 2 }}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Summary bar */}
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                {[
                  { label: 'Reports',  val: String(chartData.reduce((s, d) => s + d.reports, 0)),  color: 'text-violet-600 dark:text-violet-400' },
                  { label: 'Revenue',  val: fmt(chartData.reduce((s, d) => s + d.revenue, 0)),    color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Invoices', val: String(chartData.reduce((s, d) => s + d.invoices, 0)),color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Tests',    val: String(chartData.reduce((s, d) => s + d.tests, 0)),   color: 'text-amber-600 dark:text-amber-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-sm font-bold font-mono ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Quick Actions */}
        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-2.5">
            {[
              { to: '/reports/create', Icon: FiFilePlus, label: 'Create Report',   sub: 'Generate diagnostic reports', bg: 'bg-blue-50 dark:bg-blue-900/30',   text: 'text-blue-600 dark:text-blue-400',   hover: 'hover:border-blue-300 dark:hover:border-blue-600' },
              { to: '/invoice',        Icon: FiDollarSign,label: 'New Invoice',    sub: 'Create invoice & collect payment', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-300 dark:hover:border-emerald-600' },
              { to: '/tests',          Icon: FiBarChart2, label: 'Manage Tests',   sub: 'Configure lab test templates', bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', hover: 'hover:border-violet-300 dark:hover:border-violet-600' },
              { to: '/staff',          Icon: FiUsers,     label: 'Manage Staff',   sub: 'View roles and team members',  bg: 'bg-amber-50 dark:bg-amber-900/30',   text: 'text-amber-600 dark:text-amber-400',   hover: 'hover:border-amber-300 dark:hover:border-amber-600' },
            ].map(a => (
              <Link
                key={a.to}
                to={a.to}
                className={`flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 transition-all ${a.hover} hover:bg-slate-50 dark:hover:bg-slate-800/50`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${a.bg} ${a.text}`}>
                  <a.Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{a.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{a.sub}</p>
                </div>
                <FiArrowRight className="text-slate-300 dark:text-slate-600 shrink-0" size={14} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── Revenue + Report Status + Top Tests ─────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* Revenue Breakdown */}
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FiDollarSign className="text-blue-500" size={15} /> Revenue by Mode
          </h2>
          {revenueByMode.length === 0 ? (
            <EmptyState icon={FiDollarSign} msg="No revenue yet" sub="Create paid invoices to see breakdown" />
          ) : (
            <div className="space-y-3">
              {revenueByMode.map(r => (
                <div key={r.mode}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: MODE_COLORS[r.mode] || '#94a3b8' }} />
                      {r.mode}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {fmt(r.amount)} <span className="text-slate-400 font-normal">({r.pct}%)</span>
                    </span>
                  </div>
                  <ProgressBar pct={r.pct} color={MODE_COLORS[r.mode] || '#94a3b8'} />
                </div>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Paid</span>
                  <span className="font-mono font-semibold text-emerald-600">{fmt(stats.totalPaid)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Due</span>
                  <span className="font-mono font-semibold text-rose-500">{fmt(stats.totalDue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Avg Invoice</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{fmt(stats.avgInvoiceVal)}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Report Status Donut */}
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FiFileText className="text-violet-500" size={15} /> Report Status
          </h2>
          {reportStatus.length === 0 ? (
            <EmptyState icon={FiFileText} msg="No reports yet" sub="Generate reports to see status" />
          ) : (
            <>
              <div className="h-36">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={reportStatus}
                      dataKey="count"
                      nameKey="label"
                      cx="50%" cy="50%"
                      innerRadius={38} outerRadius={62}
                      paddingAngle={3}
                      isAnimationActive
                    >
                      {reportStatus.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [v, n]}
                      contentStyle={{
                        borderRadius: '12px', border: 'none',
                        background: 'var(--tooltip-bg, #fff)',
                        boxShadow: '0 4px 24px rgba(0,0,0,.12)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {reportStatus.map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-300">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Top Tests */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FiZap className="text-amber-500" size={15} /> Top Tests
            </h2>
            <select
              value={topLimit}
              onChange={e => setTopLimit(Number(e.target.value))}
              className="field py-1 text-xs"
              style={{ width: 'auto', minWidth: 70 }}
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
            </select>
          </div>
          {topTests.length === 0 ? (
            <EmptyState icon={FiBarChart2} msg="No tests yet" sub="Tests appear after invoices are created" />
          ) : (
            <div className="space-y-3">
              {topTests.map((t, i) => {
                const colors = ['#6366f1', '#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];
                const c = colors[i % colors.length];
                return (
                  <div key={t.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold text-white" style={{ background: c }}>
                          {i + 1}
                        </span>
                        <span className="truncate max-w-[110px]">{t.name}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0 ml-2">
                        {t.count}× <span className="text-slate-400 font-normal">({t.pct}%)</span>
                      </span>
                    </div>
                    <ProgressBar pct={t.pct} color={c} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Recent Reports + Recent Invoices ─────────────── */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">

        <SectionCard
          title="Recent Reports"
          action={<Link to="/reports" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>}
        >
          {stats.recentReports.length === 0 ? (
            <EmptyState icon={FiFileText} msg="No reports yet" sub="Reports will appear here once created" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentReports.map(r => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{r.patient}</p>
                    <p className="text-xs text-slate-400 truncate">{r.id} · {r.tests}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <StatusBadge status={r.status} />
                    <p className="mt-1 text-[10px] text-slate-400">{timeAgo(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Invoices"
          action={<Link to="/invoice" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>}
        >
          {stats.recentInvoices.length === 0 ? (
            <EmptyState icon={FiDollarSign} msg="No invoices yet" sub="Invoices will appear here once created" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentInvoices.map(inv => (
                <div key={inv.invoiceNo} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{inv.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{inv.invoiceNo} · {inv.paymentMode || '—'}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      (inv.dueAmount || 0) === 0
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {(inv.dueAmount || 0) === 0 ? 'Paid' : 'Pending'}
                    </span>
                    <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{fmt(inv.grandTotal)}</p>
                    <p className="text-[10px] text-slate-400">{timeAgo(inv.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Recent Activity ──────────────────────────────── */}
      <div className="mt-6">
        <SectionCard
          title="Recent Activity"
          action={
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </span>
          }
        >
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={FiActivity}
              msg="No activity yet"
              sub="Activity appears automatically as you create invoices and reports"
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence initial={false}>
                {recentActivity.map((a, idx) => (
                  <motion.div
                    key={a.id || idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Icon */}
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-base select-none">
                      {a.icon || '📌'}
                    </span>
                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{a.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{a.detail}</p>
                    </div>
                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {timeAgo(a.timestamp)}
                      </p>
                      <p className="text-[9px] text-slate-300 dark:text-slate-600 whitespace-nowrap mt-0.5">
                        {exactTime(a.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
