import { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiDatabase, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

export default function AdminBackupPage() {
  const [backups, setBackups] = useState(() => adminService.getBackupHistory());
  const [importing, setImporting] = useState(false);
  const importRef = useRef(null);

  const handleCreateBackup = () => {
    const backup = adminService.createBackup();
    setBackups(adminService.getBackupHistory());
    toast.success(`Backup created: ${backup.name}`);
  };

  const handleExportBackup = (backup) => {
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const handleRestore = (backup) => {
    adminService.restoreBackup(backup);
    toast.success('Backup restored successfully');
    setBackups(adminService.getBackupHistory());
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        adminService.importBackup(parsed);
        toast.success('Backup imported successfully');
        setBackups(adminService.getBackupHistory());
      } catch {
        toast.error('Invalid backup file');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Backup & Restore"
        description="Create and manage system-wide backups."
        action={
          <button className={adminBtnPrimary} onClick={handleCreateBackup}>
            <FiRefreshCw /> Create Backup
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Create backup */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="text-amber-500" size={18} />
            <h2 className="text-sm font-semibold text-white">Backup System Data</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">Create a full snapshot of the laboratory registry, payments, subscriptions, notifications and activity logs.</p>
          <button className={adminBtnPrimary} onClick={handleCreateBackup}>
            <FiDatabase size={14} /> Create Full Backup
          </button>
        </div>

        {/* Import backup */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiUpload className="text-blue-500" size={18} />
            <h2 className="text-sm font-semibold text-white">Import Backup</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">Restore from a previously exported backup file.</p>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <button className={adminBtnSecondary} onClick={() => importRef?.click()}>
            {importing ? 'Importing...' : <><FiUpload size={14} /> Import Backup File</>}
          </button>
        </div>
      </div>

      {/* Backup history */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Backup History</h2>
        </div>
        {backups.length === 0 ? (
          <div className="py-16 text-center">
            <FiDatabase className="mx-auto mb-3 text-3xl text-slate-700" />
            <p className="text-sm text-slate-400">No backups created yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {backups.map(b => (
              <div key={b.id} className="flex flex-wrap items-center justify-between px-5 py-4 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white font-mono">{b.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(b.createdAt)} · {b.recordCount || 0} records</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className={adminBtnSecondary + ' text-xs py-1.5 px-3'} onClick={() => handleRestore(b)}>Restore</button>
                  <button className={adminBtnSecondary + ' text-xs py-1.5 px-3'} onClick={() => handleExportBackup(b)}>
                    <FiDownload size={12} /> Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

