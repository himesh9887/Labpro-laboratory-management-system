import { useState, useEffect } from 'react';
import { FiLogIn, FiFilter } from 'react-icons/fi';
import { AdminPageHeader, StatusPill, AdminEmpty, adminInputClass } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminLoginHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [labFilter, setLabFilter] = useState('');

  useEffect(() => {
    setLogs(adminService.getAllLoginHistory());
  }, []);

  const filtered = labFilter ? logs.filter(l => l.labId === labFilter) : logs;
  const labIds = [...new Set(logs.map(l => l.labId).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Login History" description={`${logs.length} login attempts recorded.`} />

      <div className="flex items-center gap-2">
        <FiFilter className="text-slate-400" size={14} />
        <select className={adminInputClass + ' w-48'} value={labFilter} onChange={e => setLabFilter(e.target.value)}>
          <option value="">All Laboratories</option>
          {labIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <AdminEmpty icon={FiLogIn} msg="No login history" sub="Login attempts will appear here." />
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                <tr>
                  {['Lab', 'Email', 'IP Address', 'Device', 'Status', 'Time'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-amber-400">{log.labId || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{log.email || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ip || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.device || log.userAgent ? (log.device || 'Browser') : '—'}</td>
                    <td className="px-4 py-3"><StatusPill status={log.success ? 'Active' : 'Inactive'} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(log.timestamp || log.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

