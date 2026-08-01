import { useState, useEffect, useMemo } from 'react';
import { FiActivity, FiFilter } from 'react-icons/fi';
import { AdminPageHeader, AdminEmpty, adminInputClass } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [labFilter, setLabFilter] = useState('');

  useEffect(() => {
    setLogs(adminService.getAllActivityLogs());
  }, []);

  const filtered = useMemo(() => {
    if (!labFilter) return logs;
    return logs.filter(l => l.labId === labFilter);
  }, [logs, labFilter]);

  const labIds = useMemo(() => [...new Set(logs.map(l => l.labId).filter(Boolean))].sort(), [logs]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Activity Log" description={`${logs.length} system events recorded.`} />

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
            <AdminEmpty icon={FiActivity} msg="No activity recorded" sub="System events will appear here." />
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                <tr>
                  {['', 'Event', 'Detail', 'Lab', 'Time'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-base">{log.icon || '📌'}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{log.title}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[280px] truncate">{log.detail || '—'}</td>
                    <td className="px-4 py-3">
                      {log.labId ? (
                        <span className="font-mono text-xs font-bold text-amber-400">{log.labId}</span>
                      ) : (
                        <span className="text-xs text-slate-500">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(log.timestamp)}</td>
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

