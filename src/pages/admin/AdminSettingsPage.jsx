import { useState, useEffect } from 'react';
import { FiSave, FiShield, FiDatabase, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, adminBtnPrimary, adminInputClass } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

function Toggle({ value, onChange }) {
  return (
    <button
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-700'}`}
      onClick={() => onChange(!value)}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('LabPro LIMS');
  const [platformEmail, setPlatformEmail] = useState('support@labpro.in');
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [sessionTimeout, setSessionTimeout] = useState(60);

  // Load persisted platform settings on mount
  useEffect(() => {
    const s = adminService.getPlatformSettings();
    if (s.platformName) setPlatformName(s.platformName);
    if (s.platformEmail) setPlatformEmail(s.platformEmail);
    if (typeof s.allowSelfRegistration === 'boolean') setAllowSelfRegistration(s.allowSelfRegistration);
    if (typeof s.requireApproval === 'boolean') setRequireApproval(s.requireApproval);
    if (s.retentionDays) setRetentionDays(s.retentionDays);
    if (s.sessionTimeout) setSessionTimeout(s.sessionTimeout);
  }, []);

  const handleSave = () => {
    adminService.savePlatformSettings({
      platformName,
      platformEmail,
      allowSelfRegistration,
      requireApproval,
      retentionDays,
      sessionTimeout,
    });
    toast.success('Platform settings saved');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Platform Settings" description="Configure global platform behaviour." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiGlobe className="text-blue-500" size={16} />
            <h2 className="text-sm font-semibold text-white">General</h2>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Platform Name</span>
            <input className={adminInputClass} value={platformName} onChange={e => setPlatformName(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Support Email</span>
            <input className={adminInputClass} type="email" value={platformEmail} onChange={e => setPlatformEmail(e.target.value)} />
          </label>
        </div>

        {/* Registration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiDatabase className="text-amber-500" size={16} />
            <h2 className="text-sm font-semibold text-white">Registration</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Allow self-registration</p>
              <p className="text-xs text-slate-400">Let new laboratories register directly</p>
            </div>
            <Toggle value={allowSelfRegistration} onChange={setAllowSelfRegistration} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Require admin approval</p>
              <p className="text-xs text-slate-400">New labs need manual approval</p>
            </div>
            <Toggle value={requireApproval} onChange={setRequireApproval} />
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FiShield className="text-emerald-500" size={16} />
            <h2 className="text-sm font-semibold text-white">Security</h2>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Session Timeout (minutes)</span>
            <input className={adminInputClass} type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} min={5} max={480} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Data Retention (days)</span>
            <input className={adminInputClass} type="number" value={retentionDays} onChange={e => setRetentionDays(Number(e.target.value))} min={7} max={3650} />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button className={adminBtnPrimary} onClick={handleSave}>
          <FiSave size={14} /> Save Settings
        </button>
      </div>
    </div>
  );
}

