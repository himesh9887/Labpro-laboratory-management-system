import { useState } from 'react';
import { FiCheck, FiShield, FiSliders, FiUsers, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { dark, setDark } = useApp();
  const [profile, setProfile] = useState({
    name: 'LabPro Diagnostics',
    license: 'NABL-2026-48091',
    email: 'care@labprodiagnostics.in',
    phone: '+91 80 4567 8900',
    address: '24, Health Plaza, Indiranagar, Bengaluru, Karnataka 560038',
  });

  const nav = [
    ['profile', 'Laboratory profile', FiSliders],
    ['users', 'Users & roles', FiUsers],
    ['security', 'Security & appearance', FiShield],
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your laboratory profile, workflow and access preferences."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <nav className="card h-max p-2">
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

        <section className="card p-6 xl:col-span-2">
          {tab === 'profile' && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Laboratory profile</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This information appears on reports and invoices.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
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
              <div className="mt-6 flex justify-end">
                <button className="btn-primary" onClick={() => toast.success('Settings saved')}>
                  <FiCheck /> Save changes
                </button>
              </div>
            </>
          )}

          {tab === 'users' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Users & roles</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage roles from the Staff workspace.</p>
              <button className="btn-primary mt-6" onClick={() => toast('Open Staff from the sidebar to manage roles.')}>
                Open staff management
              </button>
            </div>
          )}

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
                <button className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${dark ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setDark(!dark)}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
