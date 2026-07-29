import { useRef, useState } from 'react';
import {
  FiCheck, FiShield, FiSliders, FiUsers, FiSun, FiMoon,
  FiDatabase, FiDownload, FiUpload, FiTrash2, FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useSettings } from '../hooks/useSettings';

const RETENTION_OPTIONS = [
  { value: 1,    label: '1 Day' },
  { value: 7,    label: '7 Days' },
  { value: 15,   label: '15 Days' },
  { value: 30,   label: '30 Days' },
  { value: null, label: 'Never Delete' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { dark, setDark } = useApp();
  const { settings, updateSettings } = useSettings();
  const { clearTodayData, clearAllData, exportData, importData, loadHistory } = useData();

  const [profile, setProfile] = useState({
    name:    settings.labProfile?.name    || 'LabPro Diagnostics',
    license: settings.labProfile?.license || 'NABL-2026-48091',
    email:   settings.labProfile?.email   || 'care@labprodiagnostics.in',
    phone:   settings.labProfile?.phone   || '+91 80 4567 8900',
    address: settings.labProfile?.address || '24, Health Plaza, Indiranagar, Bengaluru, Karnataka 560038',
  });

  const [confirmClearToday, setConfirmClearToday] = useState(false);
  const [confirmClearAll,   setConfirmClearAll]   = useState(false);
  const [history,           setHistory]           = useState(null);
  const importRef = useRef(null);

  const nav = [
    ['profile',  'Laboratory profile',   FiSliders],
    ['users',    'Users & roles',        FiUsers],
    ['security', 'Security & appearance', FiShield],
    ['storage',  'Data & Storage',       FiDatabase],
  ];

  // ── Handlers ────────────────────────────────────────────
  const handleSaveProfile = () => {
    updateSettings({ labProfile: profile });
    toast.success('Settings saved');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `labpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported as JSON');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        importData(parsed);
        toast.success('Data imported successfully');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearToday = () => {
    clearTodayData();
    setConfirmClearToday(false);
    toast.success("Today's data cleared");
  };

  const handleClearAll = () => {
    clearAllData();
    setConfirmClearAll(false);
    toast.success('All data cleared');
  };

  const handleViewHistory = () => {
    const h = loadHistory();
    setHistory(h);
  };

  const Toggle = ({ value, onChange }) => (
    <button
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
      onClick={() => onChange(!value)}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your laboratory profile, workflow and access preferences."
      />
      <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-3">
        <nav className="card h-max p-2 sm:col-span-1">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                tab === id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>

        <section className="card p-6 sm:col-span-2 xl:col-span-2">
          {/* ── Profile ── */}
          {tab === 'profile' && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Laboratory profile</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This information appears on reports and invoices.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[['name', 'Laboratory name'], ['license', 'License number'], ['email', 'Email address'], ['phone', 'Phone number']].map(([key, label]) => (
                  <label key={key}>
                    <span className="label">{label}</span>
                    <input className="field" value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} />
                  </label>
                ))}
                <label className="md:col-span-2">
                  <span className="label">Address</span>
                  <textarea className="field h-20" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                </label>
              </div>
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button className="btn-primary w-full sm:w-auto" onClick={handleSaveProfile}>
                  <FiCheck /> Save changes
                </button>
              </div>
            </>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Users & roles</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage roles from the Staff workspace.</p>
              <button className="btn-primary mt-6" onClick={() => toast('Open Staff from the sidebar to manage roles.')}>
                Open staff management
              </button>
            </div>
          )}

          {/* ── Security & Appearance ── */}
          {tab === 'security' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security & appearance</h2>
              <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {dark ? <FiMoon className="text-blue-500" /> : <FiSun className="text-amber-500" />}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Dark mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark themes</p>
                  </div>
                </div>
                <Toggle value={dark} onChange={setDark} />
              </div>
            </div>
          )}

          {/* ── Data & Storage ── */}
          {tab === 'storage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data & Storage</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control how LabPro stores and retains your data locally.</p>
              </div>

              {/* Auto Clear toggle */}
              <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Retention Settings</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Auto Clear Daily</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Automatically prune old data each day</p>
                  </div>
                  <Toggle
                    value={settings.autoClear}
                    onChange={(v) => updateSettings({ autoClear: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Keep History</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Archive invoices instead of deleting them</p>
                  </div>
                  <Toggle
                    value={settings.keepHistory}
                    onChange={(v) => updateSettings({ keepHistory: v })}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Retention Period</p>
                  <div className="flex flex-wrap gap-2">
                    {RETENTION_OPTIONS.map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => updateSettings({ retentionDays: opt.value })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${
                          settings.retentionDays === opt.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Import / Export */}
              <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Backup & Restore</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
                    <FiDownload size={14} /> Export Data (JSON)
                  </button>
                  <button className="btn-secondary flex items-center gap-2" onClick={() => importRef.current?.click()}>
                    <FiUpload size={14} /> Import Data (JSON)
                  </button>
                  <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                </div>
              </div>

              {/* History viewer */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice History</h3>
                <button className="btn-secondary flex items-center gap-2" onClick={handleViewHistory}>
                  <FiDatabase size={14} /> View Archived Invoices
                </button>
                {history !== null && (
                  <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                    {Object.keys(history).length === 0 ? (
                      <p className="text-sm text-slate-400">No archived invoices found.</p>
                    ) : (
                      Object.entries(history)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, invs]) => (
                          <div key={date}>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{date}</p>
                            <div className="space-y-1">
                              {invs.map(inv => (
                                <div key={inv.invoiceNo} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                                  <span className="text-xs font-mono text-blue-600">{inv.invoiceNo}</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400">{inv.patientName}</span>
                                  <span className="text-xs font-mono text-slate-500">₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="text-rose-500 shrink-0" />
                  <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">Danger Zone</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    onClick={() => setConfirmClearToday(true)}
                  >
                    <FiTrash2 size={14} /> Clear Today's Data
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                    onClick={() => setConfirmClearAll(true)}
                  >
                    <FiTrash2 size={14} /> Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmClearToday}
        onClose={() => setConfirmClearToday(false)}
        onConfirm={handleClearToday}
        title="Clear today's data?"
        message="This will remove all invoices created today. The action cannot be undone."
      />
      <ConfirmDialog
        open={confirmClearAll}
        onClose={() => setConfirmClearAll(false)}
        onConfirm={handleClearAll}
        title="Clear ALL data?"
        message="This will permanently wipe all invoices, patients, reports and history from local storage. This cannot be undone."
      />
    </>
  );
}
