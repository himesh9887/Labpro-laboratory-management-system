import { useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const initialPatients = [
  { id: 'LP-240185', name: 'Aarav Sharma', age: 42, gender: 'Male', phone: '+91 98765 44321', doctor: 'Dr. Meera Kapoor', status: 'In progress', collected: 'Today, 09:30 AM', address: '12, Green Park, New Delhi' },
  { id: 'LP-240186', name: 'Ananya Iyer', age: 28, gender: 'Female', phone: '+91 98450 12876', doctor: 'Dr. Rohan Das', status: 'Completed', collected: 'Today, 09:05 AM', address: '45, Lake View, Mumbai' },
  { id: 'LP-240187', name: 'Vikram Singh', age: 56, gender: 'Male', phone: '+91 99876 22019', doctor: 'Dr. Meera Kapoor', status: 'Pending', collected: 'Yesterday, 04:15 PM', address: '78, Royal Enclave, Bangalore' },
  { id: 'LP-240188', name: 'Priya Nair', age: 34, gender: 'Female', phone: '+91 98201 33455', doctor: 'Self', status: 'Completed', collected: 'Yesterday, 01:24 PM', address: '23, Seaside Road, Kochi' },
  { id: 'LP-240189', name: 'Rohan Mehta', age: 45, gender: 'Male', phone: '+91 97654 11223', doctor: 'Dr. Kavita Rao', status: 'In progress', collected: 'Today, 11:20 AM', address: '56, Sunshine Apts, Pune' },
];

const statuses = ['All statuses', 'Completed', 'Pending', 'In progress'];

export default function PatientsPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = patients.filter(p => {
    const matchesSearch = `${p.name} ${p.id} ${p.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };
  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };

  const handleDelete = () => {
    setPatients(prev => prev.filter(p => p.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
    toast.success('Patient record removed');
  };

  const handleSave = (formData) => {
    if (editing) {
      setPatients(prev => prev.map(p => p.id === editing.id ? { ...p, ...formData } : p));
      toast.success('Patient updated');
    } else {
      const newId = `LP-${String(240190 + patients.length).slice(0, 6)}`;
      setPatients(prev => [...prev, { id: newId, ...formData, collected: 'Just now' }]);
      toast.success('Patient added');
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Patient management"
        description="Manage patient profiles, history and diagnostic journeys."
        action={<button className="btn-primary" onClick={openAdd}><FiPlus /> Add patient</button>}
      />
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, UHID or phone" />
          </div>
          <div className="flex gap-2">
            <select className="field py-2 w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-secondary py-2">Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                {['Patient', 'UHID', 'Contact', 'Referring doctor', 'Collection', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.age} years · {p.gender}</p>
                  </td>
                  <td className="px-5 font-mono text-xs text-blue-600">{p.id}</td>
                  <td className="px-5 text-slate-500">{p.phone}</td>
                  <td className="px-5 text-slate-500">{p.doctor}</td>
                  <td className="px-5 text-xs text-slate-400">{p.collected}</td>
                  <td className="px-5"><StatusBadge status={p.status} /></td>
                  <td className="px-5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><FiEdit2 size={14} /></button>
                      <button onClick={() => confirmDelete(p.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PatientFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Remove patient" message="This will permanently delete all records for this patient." />
    </>
  );
}

function PatientFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', age: '', gender: 'Male', phone: '', doctor: '', address: '', status: 'Pending' });

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const handleSubmit = (e) => { e.preventDefault(); if (!form.name) return; onSave(form); };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit patient' : 'Add new patient'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="md:col-span-2"><span className="label">Full name</span><input className="field" value={form.name} onChange={e => set('name', e.target.value)} required /></label>
          <label><span className="label">Age</span><input className="field" type="number" value={form.age} onChange={e => set('age', e.target.value)} /></label>
          <label><span className="label">Gender</span><select className="field" value={form.gender} onChange={e => set('gender', e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></label>
          <label><span className="label">Phone</span><input className="field" value={form.phone} onChange={e => set('phone', e.target.value)} /></label>
          <label><span className="label">Referring doctor</span><input className="field" value={form.doctor} onChange={e => set('doctor', e.target.value)} /></label>
          <label><span className="label">Status</span><select className="field" value={form.status} onChange={e => set('status', e.target.value)}><option>Pending</option><option>In progress</option><option>Completed</option></select></label>
          <label className="md:col-span-3"><span className="label">Address</span><textarea className="field" rows={2} value={form.address || ''} onChange={e => set('address', e.target.value)} /></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary"><FiUser size={16} /> {initial ? 'Update' : 'Add'} patient</button>
        </div>
      </form>
    </Modal>
  );
}

