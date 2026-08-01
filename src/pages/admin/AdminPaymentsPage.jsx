import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminStatCard, StatusPill, AdminModal, AdminEmpty, adminInputClass, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Credit', 'Cheque'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setPayments(adminService.getPayments());
    setLabs(adminService.getAllLabs());
  }, []);

  const stats = {
    totalPaid: payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0),
    totalPending: payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount || 0), 0),
    count: payments.length,
  };

  const filtered = payments.filter(p =>
    `${p.labId} ${p.labName} ${p.mode}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordPayment = (data) => {
    adminService.recordPayment(data.labId, data.amount, data.mode, data.notes);
    toast.success(`Payment of ${fmtINR(data.amount)} recorded`);
    setPayments(adminService.getPayments());
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment History"
        description={`${payments.length} payments recorded.`}
        action={
          <button className={adminBtnPrimary} onClick={() => setModalOpen(true)}>
            <FiPlus /> Record Payment
          </button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Total Paid" value={fmtINR(stats.totalPaid)} icon={FiDollarSign} tone="green" />
        <AdminStatCard label="Total Pending" value={fmtINR(stats.totalPending)} icon={FiDollarSign} tone="amber" />
        <AdminStatCard label="Transactions" value={stats.count} icon={FiDollarSign} tone="blue" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className={adminInputClass + ' pl-9'} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                {['Lab', 'Amount', 'Mode', 'Status', 'Date', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><AdminEmpty icon={FiDollarSign} msg="No payments" sub="Record your first payment." /></td></tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3"><p className="font-semibold text-white">{p.labName || p.labId}</p><p className="text-xs text-slate-400 font-mono">{p.labId}</p></td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{fmtINR(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-400">{p.mode || p.paymentMode}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status || 'Paid'} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(p.date || p.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate">{p.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment" size="sm">
        <PaymentForm labs={labs} onSave={handleRecordPayment} onCancel={() => setModalOpen(false)} />
      </AdminModal>
    </div>
  );
}

function PaymentForm({ labs, onSave, onCancel }) {
  const [form, setForm] = useState({ labId: '', amount: '', mode: 'Bank Transfer', notes: '' });
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.labId || !amount || amount <= 0) return;
    onSave({ ...form, amount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Laboratory</span>
        <select className={adminInputClass} value={form.labId} onChange={e => set('labId', e.target.value)} required>
          <option value="">Select lab</option>
          {labs.filter(l => l.status !== 'Deleted').map(l => <option key={l.labId} value={l.labId}>{l.labId} - {l.labName}</option>)}
        </select>
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Amount (₹)</span>
        <input className={adminInputClass} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Enter amount" min="1" required />
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Payment Mode</span>
        <select className={adminInputClass} value={form.mode} onChange={e => set('mode', e.target.value)}>
          {paymentModes.map(m => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</span>
        <textarea className={adminInputClass + ' h-16 resize-none'} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className={adminBtnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className={adminBtnPrimary}>Record Payment</button>
      </div>
    </form>
  );
}

