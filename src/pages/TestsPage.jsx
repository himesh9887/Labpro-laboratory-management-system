import { useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const initialTests = [
  { id: 'TST-001', name: 'Complete Blood Count', code: 'CBC', department: 'Hematology', price: 400, parameters: ['Hemoglobin', 'WBC Count', 'RBC Count', 'Platelet Count', 'MCV', 'MCH', 'MCHC', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'], specimen: 'Whole Blood (EDTA)', method: 'Impedance / Flow cytometry', interpretation: 'CBC is used to evaluate overall health and detect a wide range of disorders including anemia, infection, and leukemia.', status: 'Active' },
  { id: 'TST-002', name: 'Liver Function Test', code: 'LFT', department: 'Biochemistry', price: 700, parameters: ['Total Bilirubin', 'Direct Bilirubin', 'SGOT (AST)', 'SGPT (ALT)', 'Albumin', 'Total Protein', 'ALP', 'A/G Ratio'], specimen: 'Serum', method: 'Photometry', interpretation: 'LFT helps evaluate liver health by measuring enzymes, proteins, and bilirubin levels.', status: 'Active' },
  { id: 'TST-003', name: 'Kidney Function Test', code: 'KFT', department: 'Biochemistry', price: 600, parameters: ['Urea', 'Creatinine', 'Uric Acid', 'Sodium', 'Potassium', 'Chloride', 'Calcium', 'eGFR'], specimen: 'Serum', method: 'Photometry / ISE', interpretation: 'KFT assesses kidney function by measuring waste products and electrolytes.', status: 'Active' },
  { id: 'TST-004', name: 'Vitamin D (25-OH)', code: 'VITD', department: 'Immunoassay', price: 1200, parameters: ['Vitamin D (25-OH)'], specimen: 'Serum', method: 'CLIA', interpretation: 'Vitamin D is essential for bone health and immune function.', status: 'Active' },
  { id: 'TST-005', name: 'HbA1c (Glycated Hemoglobin)', code: 'HBA1C', department: 'Biochemistry', price: 500, parameters: ['HbA1c', 'Estimated Average Glucose'], specimen: 'Whole Blood (EDTA)', method: 'HPLC', interpretation: 'HbA1c reflects average blood glucose over the past 2-3 months.', status: 'Active' },
  { id: 'TST-006', name: 'Blood Sugar (Fasting & PP)', code: 'BS', department: 'Biochemistry', price: 200, parameters: ['Fasting Blood Sugar', 'Post Prandial Blood Sugar', 'Random Blood Sugar'], specimen: 'Serum / Plasma', method: 'Hexokinase', interpretation: 'Blood sugar levels help diagnose and monitor diabetes mellitus.', status: 'Active' },
  { id: 'TST-007', name: 'Lipid Profile', code: 'LIPID', department: 'Biochemistry', price: 800, parameters: ['Total Cholesterol', 'Triglycerides', 'HDL Cholesterol', 'LDL Cholesterol', 'VLDL Cholesterol', 'Non HDL Cholesterol'], specimen: 'Serum (Fasting)', method: 'Enzymatic colorimetry', interpretation: 'Lipid profile measures cholesterol and triglycerides to assess cardiovascular risk.', status: 'Active' },
  { id: 'TST-008', name: 'Thyroid Profile', code: 'TFT', department: 'Immunoassay', price: 850, parameters: ['T3 (Triiodothyronine)', 'T4 (Thyroxine)', 'TSH (Thyroid Stimulating Hormone)'], specimen: 'Serum', method: 'CLIA', interpretation: 'Thyroid profile evaluates thyroid gland function.', status: 'Active' },
  { id: 'TST-009', name: 'Urine Routine & Microscopy', code: 'URINE', department: 'Clinical Pathology', price: 300, parameters: ['Color', 'Appearance', 'pH', 'Protein', 'Sugar', 'Ketones', 'Blood', 'Bilirubin', 'Pus Cells', 'RBCs', 'Casts', 'Crystals'], specimen: 'Urine (Mid-stream)', method: 'Dipstick / Microscopy', interpretation: 'Urine analysis helps detect urinary tract infections and kidney disease.', status: 'Active' },
  { id: 'TST-010', name: 'Iron Profile', code: 'IRON', department: 'Biochemistry', price: 900, parameters: ['Serum Iron', 'Total Iron Binding Capacity', 'Transferrin Saturation', 'Ferritin'], specimen: 'Serum', method: 'Colorimetry', interpretation: 'Iron profile helps diagnose iron deficiency anemia and iron overload disorders.', status: 'Active' },
  { id: 'TST-011', name: 'Dengue Profile', code: 'DENGUE', department: 'Immunoassay', price: 1100, parameters: ['Dengue NS1 Antigen', 'Dengue IgM Antibody', 'Dengue IgG Antibody'], specimen: 'Serum', method: 'ELISA / Rapid', interpretation: 'Dengue serology helps diagnose dengue virus infection.', status: 'Active' },
  { id: 'TST-012', name: 'Electrolytes Panel', code: 'ELYTE', department: 'Biochemistry', price: 500, parameters: ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Magnesium'], specimen: 'Serum', method: 'ISE', interpretation: 'Electrolyte panel evaluates the balance of essential minerals in the body.', status: 'Active' },
];

const departments = ['Hematology', 'Biochemistry', 'Immunoassay', 'Microbiology', 'Clinical Pathology', 'Coagulation', 'Molecular Biology'];
const statuses = ['Active', 'Inactive'];

export default function TestsPage() {
  const [tests, setTests] = useState(initialTests);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = tests.filter(t =>
    `${t.name} ${t.code} ${t.department}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };
  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };

  const handleDelete = () => {
    setTests(prev => prev.filter(t => t.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
    toast.success('Test removed');
  };

  const handleSave = (formData) => {
    if (editing) {
      setTests(prev => prev.map(t => t.id === editing.id ? { ...t, ...formData } : t));
      toast.success('Test updated');
    } else {
      const newId = `TST-${String(tests.length + 1).padStart(3, '0')}`;
      setTests(prev => [...prev, { id: newId, ...formData, status: 'Active' }]);
      toast.success('Test added');
    }
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Test Master"
        description="Configure laboratory investigations, departments, pricing and result templates."
        action={
          <button className="btn-primary" onClick={openAdd}>
            <FiPlus /> Add Test
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by test name, code or department..." />
          </div>
          <p className="text-xs text-slate-400">{filtered.length} tests configured</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                {['Test Name', 'Code', 'Department', 'Price', 'Parameters', 'Specimen', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</p>
                  </td>
                  <td className="px-5 font-mono text-xs font-medium text-blue-600">{t.code}</td>
                  <td className="px-5 text-slate-500">{t.department}</td>
                  <td className="px-5 font-mono font-semibold text-slate-700 dark:text-slate-300">₹{t.price?.toLocaleString('en-IN')}</td>
                  <td className="px-5 text-slate-500">{t.parameters?.length || 0} params</td>
                  <td className="px-5 text-xs text-slate-400">{t.specimen || '—'}</td>
                  <td className="px-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"><FiEdit2 size={14} /></button>
                      <button onClick={() => confirmDelete(t.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TestFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} departments={departments} statuses={statuses} />
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete test" message="This will permanently remove this test from the catalog." />
    </>
  );
}

function TestFormModal({ open, onClose, onSave, initial, departments, statuses }) {
  const [form, setForm] = useState(
    initial || {
      name: '', code: '', department: 'Biochemistry', price: '', parameters: '',
      specimen: '', method: '', interpretation: '', status: 'Active'
    }
  );

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return toast.error('Test name and code are required');
    onSave({
      ...form,
      price: Number(form.price) || 0,
      parameters: form.parameters ? form.parameters.split(',').map(p => p.trim()).filter(Boolean) : [],
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit test' : 'Add new test'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="label">Test name</span>
            <input className="field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Complete Blood Count" required />
          </label>
          <label>
            <span className="label">Test code</span>
            <input className="field" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. CBC" required />
          </label>
          <label>
            <span className="label">Department</span>
            <select className="field" value={form.department} onChange={e => set('department', e.target.value)}>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Price (₹)</span>
            <input className="field" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
          </label>
          <label>
            <span className="label">Status</span>
            <select className="field" value={form.status} onChange={e => set('status', e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="label">Parameters (comma-separated)</span>
            <input className="field" value={Array.isArray(form.parameters) ? form.parameters.join(', ') : form.parameters} onChange={e => set('parameters', e.target.value)} placeholder="Hemoglobin, WBC Count, RBC Count..." />
          </label>
          <label>
            <span className="label">Specimen type</span>
            <input className="field" value={form.specimen || ''} onChange={e => set('specimen', e.target.value)} placeholder="e.g. Whole Blood (EDTA)" />
          </label>
          <label>
            <span className="label">Method</span>
            <input className="field" value={form.method || ''} onChange={e => set('method', e.target.value)} placeholder="e.g. Impedance / Flow cytometry" />
          </label>
          <label className="md:col-span-2">
            <span className="label">Interpretation</span>
            <textarea className="field h-20" value={form.interpretation || ''} onChange={e => set('interpretation', e.target.value)} placeholder="Clinical interpretation of this test..." />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary"><FiActivity size={16} /> {initial ? 'Update' : 'Add'} test</button>
        </div>
      </form>
    </Modal>
  );
}


