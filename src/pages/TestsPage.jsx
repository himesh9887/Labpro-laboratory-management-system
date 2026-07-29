import { useState, useMemo } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiActivity, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import NumericInput from '../components/ui/NumericInput';
import { TEST_MASTER, DEPARTMENTS, getParameterNames } from '../data/testMaster';

// Build initial list from centralized master
const buildInitialTests = () =>
  TEST_MASTER.map((t, i) => ({
    ...t,
    id: `TST-${String(i + 1).padStart(3, '0')}`,
    parameters: getParameterNames(t),
  }));

const ALL_STATUSES = ['Active', 'Inactive'];

export default function TestsPage() {
  const [tests, setTests] = useState(buildInitialTests);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() =>
    tests.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${t.name} ${t.code} ${t.department}`.toLowerCase().includes(q);
      const matchDept = !deptFilter || t.department === deptFilter;
      return matchSearch && matchDept;
    }),
    [tests, search, deptFilter]
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

  // All departments present in current list
  const activeDepts = useMemo(() => {
    const depts = [...new Set(tests.map(t => t.department))].sort();
    return depts;
  }, [tests]);

  return (
    <>
      <PageHeader
        title="Test Master"
        description={`${tests.length} laboratory investigations configured across ${activeDepts.length} departments.`}
        action={
          <button className="btn-primary w-full sm:w-auto" onClick={openAdd}>
            <FiPlus /> Add Test
          </button>
        }
      />

      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                className="field pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search test name, code or department..."
              />
            </div>
            <div className="relative flex items-center gap-2">
              <FiFilter className="text-slate-400 shrink-0" size={14} />
              <select
                className="field py-2.5 pr-8"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {activeDepts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400 shrink-0">{filtered.length} of {tests.length} tests</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                {['#', 'Test Name', 'Code', 'Department', 'Price', 'Params', 'Specimen', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
                    No tests found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{t.name}</p>
                      {t.specimen && <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">{t.specimen}</p>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600 whitespace-nowrap">{t.code}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{t.department}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      ₹{(t.price || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium dark:bg-slate-800">
                        {Array.isArray(t.parameters) ? t.parameters.length : 0} params
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[140px] truncate hidden lg:table-cell">{t.specimen || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        t.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit test"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(t.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors"
                          title="Delete test"
                        >
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

      <TestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        departments={DEPARTMENTS}
        statuses={ALL_STATUSES}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete test"
        message="This will permanently remove this test from the catalog."
      />
    </>
  );
}

function TestFormModal({ open, onClose, onSave, initial, departments, statuses }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, parameters: Array.isArray(initial.parameters) ? initial.parameters.join(', ') : initial.parameters }
      : { name: '', code: '', department: 'Biochemistry', price: '', parameters: '', specimen: '', method: '', interpretation: '', status: 'Active' }
  );
  const [priceStr, setPriceStr] = useState(initial ? String(initial.price || '') : '');

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Test name is required');
    if (!form.code.trim()) return toast.error('Test code is required');
    const price = Number(priceStr);
    if (priceStr !== '' && (isNaN(price) || price < 0)) return toast.error('Price must be a positive number');
    onSave({
      ...form,
      price: priceStr === '' ? 0 : price,
      parameters: form.parameters ? form.parameters.split(',').map(p => p.trim()).filter(Boolean) : [],
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Test' : 'Add New Test'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Test Name</span>
            <input className="field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Complete Blood Count" required />
          </label>
          <label>
            <span className="label">Test Code</span>
            <input className="field" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. CBC" required />
          </label>
          <label>
            <span className="label">Department</span>
            <select className="field" value={form.department} onChange={e => set('department', e.target.value)}>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Price (₹)</span>
            <NumericInput
              value={priceStr}
              onChange={setPriceStr}
              placeholder="e.g. 500"
              min={0}
            />
          </label>
          <label>
            <span className="label">Status</span>
            <select className="field" value={form.status} onChange={e => set('status', e.target.value)}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="label">Parameters (comma-separated)</span>
            <input
              className="field"
              value={form.parameters}
              onChange={e => set('parameters', e.target.value)}
              placeholder="Hemoglobin, WBC Count, RBC Count..."
            />
          </label>
          <label>
            <span className="label">Specimen Type</span>
            <input className="field" value={form.specimen || ''} onChange={e => set('specimen', e.target.value)} placeholder="e.g. Whole Blood (EDTA)" />
          </label>
          <label>
            <span className="label">Method</span>
            <input className="field" value={form.method || ''} onChange={e => set('method', e.target.value)} placeholder="e.g. Impedance / Flow cytometry" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Clinical Interpretation</span>
            <textarea className="field h-20 resize-none" value={form.interpretation || ''} onChange={e => set('interpretation', e.target.value)} placeholder="Clinical interpretation of this test..." />
          </label>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Cancel</button>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            <FiActivity size={16} /> {initial ? 'Update' : 'Add'} Test
          </button>
        </div>
      </form>
    </Modal>
  );
}
