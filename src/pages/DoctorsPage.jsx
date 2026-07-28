import { useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const initialDoctors = [
  { name: 'Dr. Meera Kapoor', specialty: 'Internal Medicine', phone: '+91 98450 12345', email: 'meera.k@hospital.in', referrals: 142, active: true },
  { name: 'Dr. Rohan Das', specialty: 'Endocrinology', phone: '+91 98760 11109', email: 'rohan.das@clinic.in', referrals: 98, active: true },
  { name: 'Dr. Kavita Rao', specialty: 'Gynecology', phone: '+91 99220 45678', email: 'kavita.rao@care.in', referrals: 87, active: true },
  { name: 'Dr. Arjun Sethi', specialty: 'Cardiology', phone: '+91 98111 90032', email: 'arjun.sethi@heart.in', referrals: 64, active: true },
  { name: 'Dr. Sneha Verma', specialty: 'Pediatrics', phone: '+91 97654 33221', email: 'sneha.verma@kids.in', referrals: 53, active: false },
];

const specialties = ['Internal Medicine', 'Endocrinology', 'Gynecology', 'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Pulmonology', 'Nephrology', 'Oncology', 'Psychiatry', 'Ophthalmology', 'ENT', 'General Surgery', 'Urology', 'Rheumatology'];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteName, setDeleteName] = useState(null);

  const filtered = doctors.filter(d =>
    `${d.name} ${d.specialty} ${d.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };
  const confirmDelete = (name) => { setDeleteName(name); setConfirmOpen(true); };

  const handleDelete = () => {
    setDoctors(prev => prev.filter(d => d.name !== deleteName));
    setConfirmOpen(false);
    setDeleteName(null);
    toast.success('Doctor removed');
  };

  const handleSave = (formData) => {
    if (editing) {
      setDoctors(prev => prev.map(d => d.name === editing.name ? { ...d, ...formData } : d));
      toast.success('Doctor updated');
    } else {
      setDoctors(prev => [...prev, { ...formData, referrals: 0, active: true }]);
      toast.success('Doctor added');
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Referring doctors"
        description="Maintain a trusted network of clinicians and referral partners."
        action={<button className="btn-primary" onClick={openAdd}><FiPlus /> Add doctor</button>}
      />
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors" />
          </div>
          <p className="text-xs text-slate-400">{filtered.length} doctors</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                {['Doctor', 'Specialty', 'Email', 'Contact', 'Referrals (month)', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(d => (
                <tr key={d.name} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{d.name}</td>
                  <td className="px-5 text-slate-500">{d.specialty}</td>
                  <td className="px-5 text-slate-500">{d.email}</td>
                  <td className="px-5 text-slate-500">{d.phone}</td>
                  <td className="px-5 font-mono text-slate-500">{d.referrals}</td>
                  <td className="px-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${d.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><FiEdit2 size={14} /></button>
                      <button onClick={() => confirmDelete(d.name)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DoctorFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} specialties={specialties} />
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Remove doctor" message="This will remove the doctor from the referral network." />
    </>
  );
}

function DoctorFormModal({ open, onClose, onSave, initial, specialties }) {
  const [form, setForm] = useState(initial || { name: '', email: '', phone: '', specialty: 'Internal Medicine' });

  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const handleSubmit = (e) => { e.preventDefault(); if (!form.name) return; onSave(form); };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit doctor' : 'Add new doctor'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2"><span className="label">Doctor name</span><input className="field" value={form.name} onChange={e => set('name', e.target.value)} required /></label>
          <label><span className="label">Email</span><input className="field" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></label>
          <label><span className="label">Phone</span><input className="field" value={form.phone} onChange={e => set('phone', e.target.value)} /></label>
          <label className="md:col-span-2"><span className="label">Specialty</span><select className="field" value={form.specialty} onChange={e => set('specialty', e.target.value)}>{specialties.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary"><FiUserCheck size={16} /> {initial ? 'Update' : 'Add'} doctor</button>
        </div>
      </form>
    </Modal>
  );
}

