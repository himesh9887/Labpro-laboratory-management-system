import { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminStatCard, AdminModal, adminInputClass, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/AdminUI';
import adminService, { PLANS } from '../../services/adminService';

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function AdminSubscriptionsPage() {
  const [labs, setLabs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [newPlan, setNewPlan] = useState('basic');
  const [newExpiry, setNewExpiry] = useState('');

  useEffect(() => {
    setLabs(adminService.getAllLabs());
  }, []);

  // Calculate plan stats
  const planStats = Object.values(PLANS).map(p => ({
    ...p,
    count: labs.filter(l => l.plan === p.id && l.status !== 'Deleted').length,
  }));
  const totalSubscriptions = labs.filter(l => l.status !== 'Deleted').length;
  const monthlyRevenue = totalSubscriptions * (PLANS.basic?.price || 999);

  const openChange = (lab) => {
    setSelectedLab(lab);
    setNewPlan(lab.plan || 'basic');
    setNewExpiry(lab.planExpiryDate ? lab.planExpiryDate.slice(0, 10) : '');
    setModalOpen(true);
  };

  const handleChange = () => {
    if (!selectedLab) return;
    adminService.updateLabPlan(selectedLab.labId, newPlan, newExpiry || null);
    toast.success(`Plan updated for ${selectedLab.labId}`);
    setModalOpen(false);
    setSelectedLab(null);
    setLabs(adminService.getAllLabs());
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Subscription Plans" description="Manage laboratory subscription plans and billing." />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Subscriptions" value={totalSubscriptions} icon={FiUsers} tone="blue" />
        <AdminStatCard label="Monthly Revenue" value={fmtINR(monthlyRevenue)} sub="Estimated" icon={FiDollarSign} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4 mb-6">
        {planStats.map(p => (
          <div key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">
            <p className="text-lg font-bold text-white">{p.name}</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-2">{fmtINR(p.price)}</p>
            <p className="text-xs text-slate-400 mt-1">/ year</p>
            <p className="mt-3 text-sm text-slate-300">{p.count} labs</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              {p.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Laboratory Plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                {['Lab', 'Plan', 'Price', 'Start Date', 'Expiry', 'Remaining', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {labs.filter(l => l.status !== 'Deleted').map(lab => {
                const plan = PLANS[lab.plan] || PLANS.basic;
                const remaining = adminService.getRemainingDays(lab);
                return (
                  <tr key={lab.labId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{lab.labName}</p>
                      <p className="text-xs text-slate-400 font-mono">{lab.labId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        {plan.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{fmtINR(plan.price)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lab.planStartDate ? new Date(lab.planStartDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lab.planExpiryDate ? new Date(lab.planExpiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${remaining <= 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {remaining}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openChange(lab)} className={adminBtnSecondary + ' text-xs py-1.5 px-3'}>Change Plan</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={`Change Plan - ${selectedLab?.labId || ''}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Current: <strong className="text-white">{selectedLab ? (PLANS[selectedLab.plan]?.name || 'Basic') : ''}</strong></p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">New Plan</span>
            <select className={adminInputClass} value={newPlan} onChange={e => setNewPlan(e.target.value)}>
              {Object.values(PLANS).map(p => <option key={p.id} value={p.id}>{p.name} ({fmtINR(p.price)}/yr)</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Expiry Date</span>
            <input type="date" className={adminInputClass} value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
          </label>
          <div className="flex justify-end gap-3">
            <button className={adminBtnSecondary} onClick={() => setModalOpen(false)}>Cancel</button>
            <button className={adminBtnPrimary} onClick={handleChange}>Update Plan</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

