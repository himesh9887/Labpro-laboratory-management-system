import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiCheckCircle, FiClock, FiDollarSign, FiFilePlus, FiFileText, FiTrendingUp, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/dashboard/MetricCard';
import StatusBadge from '../components/common/StatusBadge';

const trend = [
  { day: 'Mon', reports: 42, revenue: 34000 },
  { day: 'Tue', reports: 58, revenue: 43000 },
  { day: 'Wed', reports: 45, revenue: 39000 },
  { day: 'Thu', reports: 68, revenue: 53000 },
  { day: 'Fri', reports: 61, revenue: 49000 },
  { day: 'Sat', reports: 74, revenue: 58000 },
  { day: 'Sun', reports: 55, revenue: 42000 },
];

const recentReports = [
  { id: 'RPT-240628', patient: 'Ananya Iyer', tests: 'CBC, LFT', date: '28 Jul 2026', status: 'Completed' },
  { id: 'RPT-240627', patient: 'Aarav Sharma', tests: 'CBC, KFT', date: '28 Jul 2026', status: 'In progress' },
  { id: 'RPT-240626', patient: 'Vikram Singh', tests: 'Thyroid Profile', date: '27 Jul 2026', status: 'Pending' },
];

const recentInvoices = [
  { id: 'INV-000001', patient: 'Aarav Sharma', amount: 1350, status: 'Paid', date: '28 Jul 2026' },
  { id: 'INV-000002', patient: 'Ananya Iyer', amount: 1240, status: 'Pending', date: '28 Jul 2026' },
  { id: 'INV-000003', patient: 'Vikram Singh', amount: 850, status: 'Pending', date: '27 Jul 2026' },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Good morning, Dr. Menon"
        description="Here's a real-time overview of your laboratory operations."
        action={
          <Link to="/reports/create" className="btn-primary">
            <FiFilePlus /> New Report
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Today's Reports" value="96" trend="+8.2% vs yesterday" icon={FiFileText} tone="violet" />
        <MetricCard label="Today's Revenue" value="₹84,250" trend="+16.8% vs yesterday" icon={FiDollarSign} tone="blue" />
        <MetricCard label="Today's Invoices" value="18" trend="12 paid, 6 pending" icon={FiTrendingUp} tone="green" />
        <MetricCard label="Pending Reports" value="15" trend="4 need urgent attention" icon={FiClock} tone="amber" />
        <MetricCard label="Completed Reports" value="81" trend="84.4% completion rate" icon={FiCheckCircle} tone="green" />
        <MetricCard label="Pending Payments" value="₹38,450" trend="8 invoices unpaid" icon={FiAlertCircle} tone="rose" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <section className="card p-5 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Daily report volume</h2>
              <p className="text-xs text-slate-400">Last 7 days</p>
            </div>
            <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <option>Reports</option>
              <option>Revenue</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="reportsGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#2563EB" stopOpacity=".25" />
                    <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} className="dark:text-slate-500" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} className="dark:text-slate-500" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)' }} />
                <Area dataKey="reports" stroke="#2563EB" strokeWidth={3} fill="url(#reportsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-3">
            <Link to="/reports/create" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><FiFilePlus /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Create New Report</p>
                <p className="text-xs text-slate-400">Generate diagnostic reports</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
            <Link to="/invoice" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"><FiDollarSign /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">New Invoice</p>
                <p className="text-xs text-slate-400">Create invoice & collect payments</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
            <Link to="/tests" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-600 dark:hover:bg-violet-900/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"><FiBarChart2 /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Manage Tests</p>
                <p className="text-xs text-slate-400">Configure lab test templates</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </section>
      </div>

      {/* Recent Reports & Invoices */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Reports</h2>
            <Link to="/reports" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReports.map(r => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{r.patient}</p>
                  <p className="text-xs text-slate-400">{r.id} · {r.tests}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={r.status} />
                  <p className="mt-1 text-xs text-slate-400">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Invoices</h2>
            <Link to="/invoice" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{inv.patient}</p>
                  <p className="text-xs text-slate-400">{inv.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 'bg-amber-50 text-amber-700 ring-amber-600/10'}`}>{inv.status}</span>
                  <p className="mt-1 font-mono text-xs text-slate-500">₹{inv.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
