import { useMemo, useState, useEffect } from 'react';
import {
  FiUsers, FiDollarSign, FiCreditCard, FiActivity, FiTrendingUp,
} from 'react-icons/fi';
import adminService from '../../services/adminService';

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatCard({ label, value, sub, icon: Icon, tone }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-bold leading-none text-white">{value}</p>
          {sub && <p className="mt-2 text-xs font-medium text-slate-400 truncate">{sub}</p>}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.blue}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    Suspended: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Expired: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Deleted: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${map[status] || map.Inactive}`}>
      {status}
    </span>
  );
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stats = adminService.getSystemAnalytics();
    const labs = adminService.getAllLabs();
    const payments = adminService.getAllPayments();
    const logs = adminService.getAllActivityLogs();
    setData({ stats, labs, payments, logs });
    setLoading(false);
  }, []);

  const recentLabs = useMemo(() => (data?.labs || []).slice(0, 5), [data]);
  const recentPayments = useMemo(() => (data?.payments || []).slice(0, 5), [data]);
  const recentActivity = useMemo(() => (data?.logs || []).slice(0, 8), [data]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 font-display text-2xl font-bold text-white animate-pulse">
            FC
          </span>
          <p className="text-sm font-medium text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const s = data.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-amber-500">Fast Coders Platform</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Admin Dashboard</h1>
        <p className="mt-1.5 text-sm text-slate-400">Enterprise-wide overview of all laboratories, revenue and system health.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Laboratories" value={s.totalLabs ?? 0} sub={`${s.activeLabs ?? 0} active`} icon={FiUsers} tone="blue" />
        <StatCard label="Total Revenue" value={fmtINR(s.totalRevenue)} sub={`${s.totalPayments ?? 0} payments`} icon={FiDollarSign} tone="green" />
        <StatCard label="Active Subscriptions" value={s.activeSubscriptions ?? 0} sub={`${s.totalSubscriptions ?? 0} total plans`} icon={FiCreditCard} tone="violet" />
        <StatCard label="Total Records" value={(s.totalRecords ?? 0).toLocaleString('en-IN')} sub="Across all labs" icon={FiActivity} tone="amber" />
      </div>

      {/* Plan breakdown + system health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FiTrendingUp className="text-amber-500" size={15} /> Subscription Plans
          </h2>
          <div className="space-y-3">
            {(s.planBreakdown || []).map(p => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-400">{p.plan}</span>
                  <span className="text-xs font-mono font-semibold text-slate-200">{p.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                    style={{ width: `${s.totalLabs ? Math.max(4, (p.count / s.totalLabs) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent labs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FiUsers className="text-blue-500" size={15} /> Recently Registered Labs
          </h2>
          <div className="divide-y divide-slate-800">
            {recentLabs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No laboratories registered yet.</p>
            ) : (
              recentLabs.map(lab => (
                <div key={lab.labId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {lab.logo ? (
                      <img src={lab.logo} alt="" className="h-9 w-9 rounded-xl object-contain bg-slate-800" />
                    ) : (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 font-bold text-white text-xs">{lab.labName?.[0] || 'L'}</span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{lab.labName}</p>
                      <p className="text-xs text-slate-400 font-mono">{lab.labId} · {lab.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={lab.status || 'Active'} />
                    <span className="text-xs text-slate-500">{timeAgo(lab.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent payments + activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent payments */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FiDollarSign className="text-emerald-500" size={15} /> Recent Payments
          </h2>
          <div className="divide-y divide-slate-800">
            {recentPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No payments recorded yet.</p>
            ) : (
              recentPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.labName || p.labId}</p>
                    <p className="text-xs text-slate-400">{p.labId} · {p.mode || p.paymentMode}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-emerald-400">{fmtINR(p.amount)}</p>
                    <p className="text-xs text-slate-500">{timeAgo(p.date || p.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <FiActivity className="text-violet-500" size={15} /> System Activity
          </h2>
          <div className="divide-y divide-slate-800">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              recentActivity.map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-base">
                    {log.icon || '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{log.title}</p>
                    <p className="text-xs text-slate-400 truncate">{log.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(log.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
