import { useState, useEffect } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/ui/Modal';
import SearchInput from '../components/ui/SearchInput';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const STAFF_KEY = 'staff';

const DEFAULT_STAFF = [
  { id: 'STF-001', name: 'Dr. Kavita Menon',    role: 'Administrator',  email: 'kavita@labpro.in',  phone: '+91 98450 12345', department: 'Administration', active: true },
  { id: 'STF-002', name: 'Mr. Ravi Deshmukh',   role: 'Lab Technician', email: 'ravi@labpro.in',    phone: '+91 98765 43210', department: 'Hematology',      active: true },
  { id: 'STF-003', name: 'Ms. Priya Sharma',    role: 'Lab Technician', email: 'priya@labpro.in',   phone: '+91 99887 66554', department: 'Biochemistry',    active: true },
  { id: 'STF-004', name: 'Mr. Sunil Verma',     role: 'Pathologist',    email: 'sunil@labpro.in',   phone: '+91 98765 01122', department: 'Pathology',       active: true },
  { id: 'STF-005', name: 'Mrs. Anjali Gupta',   role: 'Receptionist',   email: 'anjali@labpro.in',  phone: '+91 97654 32100', department: 'Front Office',    active: true },
  { id: 'STF-006', name: 'Mr. Amit Patel',      role: 'Phlebotomist',   email: 'amit@labpro.in',    phone: '+91 96543 21009', department: 'Collection',      active: false },
];

const roles = ['Administrator', 'Pathologist', 'Lab Technician', 'Phlebotomist', 'Receptionist', 'Billing Staff', 'Quality Manager'];
const departments = ['Administration', 'Hematology', 'Biochemistry', 'Immunoassay', 'Microbiology', 'Pathology', 'Molecular Biology', 'Front Office', 'Collection', 'Billing'];

export default function StaffPage() {
  const { scopedStorage } = useAuth();

  // Load staff from scoped storage, fall back to defaults
  const [staff, setStaff] = useState(() => {
    return DEFAULT_STAFF;
  });

  // If scopedStorage becomes available (login), load from it
  useEffect(() => {
    if (!scopedStorage) return;
    const stored = scopedStorage.get(STAFF_KEY, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      setStaff(stored);
    } else {
      // First time — seed defaults
      scopedStorage.set(STAFF_KEY, DEFAULT_STAFF);
      setStaff(DEFAULT_STAFF);
    }
  }, [scopedStorage]);

  // Persist changes to scoped storage
  const persistStaff = (arr) => {
    if (scopedStorage) scopedStorage.set(STAFF_KEY, arr);
    setStaff(arr);
  };

  const [search,      setSearch]      = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);

  const filtered = staff.filter(s =>
    `${s.name} ${s.email} ${s.role} ${s.department}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };
  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };

  const handleDelete = () => {
    persistStaff(staff.filter(s => s.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
    toast.success('Staff member removed');
  };

  const handleSave = (formData) => {
    if (editing) {
      persistStaff(staff.map(s => s.id === editing.id ? { ...s, ...formData } : s));
      toast.success('Staff updated');
    } else {
      const newId = `STF-${String(staff.length + 1).padStart(3, '0')}`;
      persistStaff([...staff, { id: newId, ...formData, active: true }]);
      toast.success('Staff added');
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Staff management"
        description="Manage laboratory personnel, roles and access permissions."
        action={<button className="btn-primary w-full sm:w-auto" onClick={openAdd}><FiPlus /> Add staff</button>}
      />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, role or department..." className="md:w-80" />
          <p className="text-xs text-slate-400">{filtered.length} staff members</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                {['ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-xs text-blue-600">{s.id}</td>
                  <td className="px-5 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="px-5 text-slate-500">{s.role}</td>
                  <td className="px-5 text-slate-500">{s.department}</td>
                  <td className="px-5 text-slate-500">{s.email}</td>
                  <td className="px-5 text-slate-500">{s.phone}</td>
                  <td className="px-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><FiEdit2 size={14} /></button>
                      <button onClick={() => confirmDelete(s.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} roles={roles} departments={departments} />
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Remove staff member" message="This will deactivate their account and remove access to the system." />
    </>
  );
}

function StaffFormModal({ open, onClose, onSave, initial, roles, departments }) {
  const [form, setForm] = useState(initial || { name: '', email: '', phone: '', role: 'Lab Technician', department: 'Biochemistry' });
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit staff' : 'Add new staff'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="label">Full name</span>
            <input className="field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name" required />
          </label>
          <label>
            <span className="label">Email address</span>
            <input className="field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@labpro.in" required />
          </label>
          <label>
            <span className="label">Phone number</span>
            <input className="field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
          </label>
          <label>
            <span className="label">Role</span>
            <select className="field" value={form.role} onChange={e => set('role', e.target.value)}>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Department</span>
            <select className="field" value={form.department} onChange={e => set('department', e.target.value)}>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary"><FiUserPlus size={16} /> {initial ? 'Update' : 'Add'} staff</button>
        </div>
      </form>
    </Modal>
  );
}
