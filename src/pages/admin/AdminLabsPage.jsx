import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiTrash2, FiShield, FiRefreshCw, FiUserCheck, FiUserX, FiEdit2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminStatCard, StatusPill, AdminModal, AdminConfirmDialog, AdminEmpty, adminInputClass, adminBtnPrimary, adminBtnSecondary } from '../../components/admin/AdminUI';
import adminService, { LAB_STATUS, PLANS } from '../../services/adminService';

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli','Daman & Diu','Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'];

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function AdminLabsPage() {
  const [labs, setLabs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetLabId, setResetLabId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [editingLab, setEditingLab] = useState(null);

  const loadLabs = () => {
    setLabs(adminService.getAllLabs());
  };

  useEffect(() => { loadLabs(); }, []);

  const filtered = labs.filter(lab =>
    (
      `${lab.labId} ${lab.labName} ${lab.email} ${lab.ownerName} ${lab.adminName}`.toLowerCase().includes(search.toLowerCase())
    ) &&
    (!statusFilter || lab.status === statusFilter)
  );

  const stats = {
    total: labs.length,
    active: labs.filter(l => l.status === LAB_STATUS.ACTIVE).length,
    suspended: labs.filter(l => l.status === LAB_STATUS.SUSPENDED).length,
    expired: labs.filter(l => l.status === LAB_STATUS.EXPIRED).length,
  };

  const handleCreate = async (formData) => {
    try {
      await adminService.createLab(formData);
      toast.success('Laboratory created successfully!');
      loadLabs();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = async (formData) => {
    if (!editingLab) return;
    try {
      await adminService.updateLab(editingLab.labId, {
        labName:      formData.labName.trim(),
        ownerName:    formData.ownerName.trim(),
        adminName:    formData.adminName.trim(),
        mobile:       formData.mobile.trim(),
        email:        formData.email.trim().toLowerCase(),
        address:      formData.address.trim(),
        city:         formData.city.trim(),
        state:        formData.state.trim(),
        pincode:      formData.pincode.trim(),
        gstNumber:    formData.gstNumber?.trim() || '',
        logo:         formData.logo !== undefined ? formData.logo : (editingLab.logo || null),
        status:       formData.status || editingLab.status || LAB_STATUS.ACTIVE,
        plan:         formData.plan || editingLab.plan || 'basic',
        planStartDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : editingLab.planStartDate,
        planExpiryDate: formData.expiryDate
          ? new Date(formData.expiryDate).toISOString()
          : editingLab.planExpiryDate,
      });
      if (formData.password) {
        await adminService.resetLabPassword(editingLab.labId, formData.password);
      }
      toast.success('Laboratory updated successfully!');
      loadLabs();
      setModalOpen(false);
      setEditingLab(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSuspend = () => {
    adminService.suspendLab(confirmId);
    toast.success('Laboratory suspended');
    loadLabs();
    setConfirmOpen(false);
  };

  const handleActivate = () => {
    adminService.activateLab(confirmId);
    toast.success('Laboratory activated');
    loadLabs();
    setConfirmOpen(false);
  };

  const handleDelete = () => {
    adminService.deleteLab(confirmId);
    toast.success('Laboratory marked as deleted');
    loadLabs();
    setConfirmOpen(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    await adminService.resetLabPassword(resetLabId, newPassword);
    toast.success('Password reset successfully');
    setResetPwdOpen(false);
    setNewPassword('');
    setResetLabId(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Laboratory Management"
        description={`${labs.length} laboratories registered on the platform.`}
        action={
          <button className={adminBtnPrimary} onClick={() => setModalOpen(true)}>
            <FiPlus /> Add Laboratory
          </button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total" value={stats.total} icon={FiShield} tone="blue" />
        <AdminStatCard label="Active" value={stats.active} sub={`${((stats.active / (stats.total || 1)) * 100).toFixed(0)}%`} icon={FiUserCheck} tone="green" />
        <AdminStatCard label="Suspended" value={stats.suspended} icon={FiUserX} tone="amber" />
        <AdminStatCard label="Expired" value={stats.expired} icon={FiRefreshCw} tone="rose" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className={adminInputClass + ' pl-9'} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ID..." />
          </div>
          <div className="flex items-center gap-3">
            <select
              className={adminInputClass + ' w-40'}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {Object.values(LAB_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} labs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                {['ID', 'Lab Name', 'Email', 'Owner', 'Admin', 'Plan', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><AdminEmpty icon={FiShield} msg="No laboratories found" sub="Click 'Add Laboratory' to create one." /></td></tr>
              ) : (
                filtered.map(lab => (
                  <tr key={lab.labId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-amber-400">{lab.labId}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{lab.labName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{lab.email}</td>
                    <td className="px-4 py-3 text-slate-400">{lab.ownerName || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{lab.adminName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        {(PLANS[lab.plan]?.name || lab.plan || 'Basic')}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={lab.status || 'Active'} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {lab.status === LAB_STATUS.ACTIVE && (
                          <button onClick={() => { setConfirmId(lab.labId); setConfirmAction('suspend'); setConfirmOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-amber-500/10 hover:text-amber-400 transition-colors" title="Suspend">
                            <FiUserX size={14} />
                          </button>
                        )}
                        {lab.status !== LAB_STATUS.ACTIVE && (
                          <button onClick={() => { setConfirmId(lab.labId); setConfirmAction('activate'); setConfirmOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Activate">
                            <FiUserCheck size={14} />
                          </button>
                        )}
                        <button onClick={() => { setEditingLab(lab); setModalOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors" title="Edit">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => { setResetLabId(lab.labId); setResetPwdOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors" title="Reset Password">
                          <FiRefreshCw size={14} />
                        </button>
                        <button onClick={() => { setConfirmId(lab.labId); setConfirmAction('delete'); setConfirmOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors" title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Lab Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLab(null); }}
        title={editingLab ? `Edit Laboratory — ${editingLab.labId}` : 'Create New Laboratory'}
        size="lg"
      >
        <LabForm
          key={editingLab?.labId || 'new'}
          initial={editingLab}
          isEdit={!!editingLab}
          onSave={editingLab ? handleEdit : handleCreate}
          onCancel={() => { setModalOpen(false); setEditingLab(null); }}
        />
      </AdminModal>

      {/* Reset Password Modal */}
      <AdminModal open={resetPwdOpen} onClose={() => { setResetPwdOpen(false); setNewPassword(''); setResetLabId(null); }} title={`Reset Password - ${resetLabId || ''}`} size="sm">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">New Password</span>
            <input type="password" className={adminInputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
          </label>
          <div className="flex justify-end gap-3">
            <button className={adminBtnSecondary} onClick={() => { setResetPwdOpen(false); setNewPassword(''); }}>Cancel</button>
            <button className={adminBtnPrimary} onClick={handleResetPassword}>Reset Password</button>
          </div>
        </div>
      </AdminModal>

      {/* Confirm Dialog */}
      <AdminConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmAction === 'suspend') handleSuspend();
          else if (confirmAction === 'activate') handleActivate();
          else if (confirmAction === 'delete') handleDelete();
        }}
        title={`${confirmAction ? confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1) : 'Confirm'} Laboratory`}
        message={`Are you sure you want to ${confirmAction} ${confirmId}?`}
        confirmText={confirmAction === 'delete' ? 'Delete' : confirmAction === 'suspend' ? 'Suspend' : 'Activate'}
        variant={confirmAction === 'delete' || confirmAction === 'suspend' ? 'danger' : 'default'}
      />
    </div>
  );
}

function LabForm({ initial, isEdit, onSave, onCancel }) {
  const lab = initial || {};

  const [form, setForm] = useState({
    labName:      lab.labName      || '',
    ownerName:    lab.ownerName    || '',
    adminName:    lab.adminName    || '',
    mobile:       lab.mobile       || '',
    email:        lab.email        || '',
    password:     '',
    confirmPassword: '',
    address:      lab.address      || '',
    city:         lab.city         || '',
    state:        lab.state        || '',
    pincode:      lab.pincode      || '',
    gstNumber:    lab.gstNumber    || '',
    plan:         lab.plan         || 'basic',
    startDate:    lab.planStartDate ? lab.planStartDate.slice(0, 10) : '',
    expiryDate:   lab.planExpiryDate ? lab.planExpiryDate.slice(0, 10) : '',
    logo:         lab.logo         || null,
    status:       lab.status       || '',
  });
  const [saving, setSaving] = useState(false);
  const [logoName, setLogoName] = useState('');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2 MB.');
      return;
    }
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => set('logo', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.labName.trim() || !form.email.trim()) {
      toast.error('Laboratory name and email are required.');
      return;
    }
    if (!isEdit) {
      if (!form.password) {
        toast.error('Password is required.');
        return;
      }
      if (form.password.length < 8) {
        toast.error('Password must be at least 8 characters.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    } else if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Laboratory Name *</span>
          <input className={adminInputClass} value={form.labName} onChange={e => set('labName', e.target.value)} placeholder="e.g. Apollo Diagnostics" required />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Owner Name</span>
          <input className={adminInputClass} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Dr. Full Name" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Administrator Name</span>
          <input className={adminInputClass} value={form.adminName} onChange={e => set('adminName', e.target.value)} placeholder="Admin Full Name" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email *</span>
          <input className={adminInputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@yourlab.com" required />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</span>
          <input className={adminInputClass} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+91 98765 43210" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{isEdit ? 'New Password (optional)' : 'Password *'}</span>
          <input className={adminInputClass} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? 'Leave blank to keep current' : 'Min. 8 characters'} />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Confirm Password</span>
          <input className={adminInputClass} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" />
        </label>
        <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Address</span>
          <textarea className={adminInputClass + ' h-20 resize-none'} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">City</span>
          <input className={adminInputClass} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Mumbai" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">State</span>
          <select className={adminInputClass} value={form.state} onChange={e => set('state', e.target.value)}>
            <option value="">Select state</option>
            {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Pincode</span>
          <input className={adminInputClass} value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="6 digits" maxLength={6} />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">GST Number</span>
          <input className={adminInputClass} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} placeholder="e.g. 27AABCU9603R1ZX" />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Plan</span>
          <select className={adminInputClass} value={form.plan} onChange={e => set('plan', e.target.value)}>
            {Object.values(PLANS).map(p => <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)}/yr)</option>)}
          </select>
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Start Date</span>
          <input type="date" className={adminInputClass} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </label>
        <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Expiry Date</span>
          <input type="date" className={adminInputClass} value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
        </label>

        {/* Logo upload */}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Logo (optional)</span>
          <label htmlFor="admin-lab-logo" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-800/40 p-4 transition-colors hover:border-blue-500 hover:bg-blue-500/5">
            {form.logo ? (
              <img src={form.logo} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-700 text-slate-400">
                <FiUpload size={18} />
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-slate-300">{logoName || (form.logo ? 'Logo uploaded' : 'Click to upload logo')}</p>
              <p className="text-xs text-slate-500">PNG, JPG or SVG · Max 2 MB</p>
            </div>
          </label>
          <input id="admin-lab-logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        {/* Status */}
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Status</span>
          <select className={adminInputClass} value={form.status || 'Active'} onChange={e => set('status', e.target.value)}>
            {Object.values(LAB_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
        <button type="button" className={adminBtnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className={adminBtnPrimary} disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Laboratory'}
        </button>
      </div>
    </form>
  );
}

