import { useEffect, useMemo, useRef, useState } from 'react';
import { FiDollarSign, FiDownload, FiEye, FiFileText, FiPlus, FiPrinter, FiSearch, FiTrash2, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import NumericInput from '../components/ui/NumericInput';
import DraftRecoveryModal from '../components/ui/DraftRecoveryModal';
import { invoiceCatalog } from '../data/testMaster';
import { useInvoices } from '../hooks/useInvoices';
import { useDraft } from '../hooks/useDraft';

const GST_RATE = 0.18;

const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Credit'];

const timelineSteps = [
  { key: 'created',    label: 'Invoice Created' },
  { key: 'payment',    label: 'Payment Received' },
  { key: 'collected',  label: 'Sample Collected' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready',      label: 'Report Ready' },
  { key: 'verified',   label: 'Verified' },
  { key: 'printed',    label: 'Printed' },
  { key: 'delivered',  label: 'Delivered' },
];

const formatCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoicePage() {
  const { invoices, addInvoice, deleteInvoice, updateTimeline } = useInvoices();
  const { hasDraft, draft, clearDraft } = useDraft('invoice');

  const [showCreate, setShowCreate]           = useState(false);
  const [previewInvoice, setPreviewInvoice]   = useState(null);
  const [showTimeline, setShowTimeline]       = useState(null);
  const [confirmId, setConfirmId]             = useState(null);
  const [search, setSearch]                   = useState('');
  const [showDraftModal, setShowDraftModal]   = useState(hasDraft);
  const [restoreDraft, setRestoreDraft]       = useState(null);

  // Show draft recovery modal only once on mount
  useEffect(() => {
    if (hasDraft) setShowDraftModal(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() =>
    invoices.filter(inv =>
      `${inv.invoiceNo} ${inv.patientName} ${inv.phone}`.toLowerCase().includes(search.toLowerCase())
    ), [invoices, search]);

  const totalRevenue  = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const pendingAmount = invoices.filter(i => (i.dueAmount || 0) > 0).reduce((s, i) => s + (i.dueAmount || 0), 0);

  const handleCreateInvoice = (data) => {
    const inv = addInvoice(data);
    if (inv) {
      setShowCreate(false);
      toast.success(`Invoice ${inv.invoiceNo} created successfully!`);
    }
    return inv;
  };

  const handleDelete = () => {
    deleteInvoice(confirmId);
    setConfirmId(null);
    toast.success('Invoice removed');
  };

  const handlePrint = (invoice) => {
    setPreviewInvoice(invoice);
    setTimeout(() => { window.print(); }, 300);
  };

  const handleDownload = async (invoice) => {
    setPreviewInvoice(invoice);
    toast.success('Generating PDF...');
    setTimeout(async () => {
      const element = document.getElementById('invoice-preview');
      if (!element) return;
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
        pdf.save(`${invoice.invoiceNo}.pdf`);
        toast.success('PDF downloaded');
      } catch {
        toast.error('PDF generation failed');
      }
    }, 500);
  };

  const handleTimelineUpdate = (invoiceNo, stepKey) => {
    updateTimeline(invoiceNo, stepKey);
    toast.success('Status updated');
  };

  // Draft recovery handlers
  const handleContinueDraft = () => {
    setShowDraftModal(false);
    setRestoreDraft(draft?.data || null);
    setShowCreate(true);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftModal(false);
    setRestoreDraft(null);
  };

  return (
    <>
      {/* Draft recovery modal */}
      {showDraftModal && (
        <DraftRecoveryModal
          type="invoice"
          draft={draft}
          onContinue={handleContinueDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <PageHeader
        title="Invoice & Billing"
        description="Create invoices, manage payments, and track report status."
        action={
          <button className="btn-primary w-full sm:w-auto" onClick={() => { setShowCreate(true); setPreviewInvoice(null); setRestoreDraft(null); }}>
            <FiPlus /> New Invoice
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <FiDollarSign className="text-xl text-blue-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
          <p className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <FiDollarSign className="text-xl text-amber-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Pending Amount</p>
          <p className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="card p-5">
          <FiFileText className="text-xl text-violet-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total Invoices</p>
          <p className="mt-1 font-mono text-xl font-semibold text-slate-900 dark:text-white">{invoices.length}</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-full flex-1 md:max-w-sm">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input
              className="field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice no, patient or phone..."
            />
          </div>
          <p className="text-xs text-slate-400 shrink-0">{filtered.length} invoices</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                {['Invoice', 'Patient', 'Tests', 'Total', 'Paid', 'Due', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No invoices yet. Click &ldquo;New Invoice&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => {
                  const due = (inv.dueAmount || 0) > 0;
                  return (
                    <tr key={inv.invoiceNo} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 font-mono text-xs font-medium text-blue-600 whitespace-nowrap">{inv.invoiceNo}</td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.patientName}</p>
                        <p className="text-xs text-slate-400">{inv.phone}{inv.age ? ` · ${inv.age}Y` : ''}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 max-w-[160px] truncate">
                        {inv.selectedTests?.map(t => t.name).join(', ')}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatCurrency(inv.grandTotal)}</td>
                      <td className="px-4 py-4 font-mono text-emerald-600 whitespace-nowrap">{formatCurrency(inv.paidAmount)}</td>
                      <td className="px-4 py-4 font-mono text-rose-600 whitespace-nowrap">{formatCurrency(inv.dueAmount)}</td>
                      <td className="px-4 py-4">
                        {due ? (
                          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">Pending</span>
                        ) : (
                          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap">Paid</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => setPreviewInvoice(inv)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors" title="Preview">
                            <FiEye size={14} />
                          </button>
                          <button onClick={() => handlePrint(inv)} className="rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 transition-colors" title="Print">
                            <FiPrinter size={14} />
                          </button>
                          <button onClick={() => handleDownload(inv)} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 transition-colors" title="Download PDF">
                            <FiDownload size={14} />
                          </button>
                          {due && (
                            <button onClick={() => setShowTimeline(inv)} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors" title="Update Status">
                              <FiFileText size={14} />
                            </button>
                          )}
                          <button onClick={() => setConfirmId(inv.invoiceNo)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setRestoreDraft(null); }}
        onSave={handleCreateInvoice}
        initialDraft={restoreDraft}
      />

      <Modal open={previewInvoice !== null} onClose={() => setPreviewInvoice(null)} title={`Invoice ${previewInvoice?.invoiceNo || ''}`} size="xl">
        {previewInvoice && <InvoicePreviewHTML invoice={previewInvoice} />}
      </Modal>

      <TimelineModal
        invoice={showTimeline}
        onClose={() => setShowTimeline(null)}
        onUpdate={handleTimelineUpdate}
      />

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete invoice"
        message="This will permanently remove this invoice record."
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Create Invoice Modal (3-step wizard) with draft auto-save
// ─────────────────────────────────────────────────────────
function CreateInvoiceModal({ open, onClose, onSave, initialDraft }) {
  const { saveDraft, clearDraft } = useDraft('invoice');

  const blankPatient = { name: '', age: '', gender: 'Male', phone: '', doctor: '', address: '' };

  const [step,          setStep]          = useState(initialDraft?.step || 1);
  const [patientForm,   setPatientForm]   = useState(initialDraft?.patientForm  || blankPatient);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [selectedTests, setSelectedTests] = useState(initialDraft?.selectedTests || []);
  const [discountStr,   setDiscountStr]   = useState(initialDraft?.discountStr   || '');
  const [discountType,  setDiscountType]  = useState(initialDraft?.discountType  || 'percentage');
  const [paymentMode,   setPaymentMode]   = useState(initialDraft?.paymentMode   || 'Cash');
  const [paidStr,       setPaidStr]       = useState(initialDraft?.paidStr       || '');

  // Restore from draft when initialDraft changes (modal opens with draft)
  useEffect(() => {
    if (initialDraft) {
      setStep(initialDraft.step || 1);
      setPatientForm(initialDraft.patientForm || blankPatient);
      setSelectedTests(initialDraft.selectedTests || []);
      setDiscountStr(initialDraft.discountStr || '');
      setDiscountType(initialDraft.discountType || 'percentage');
      setPaymentMode(initialDraft.paymentMode || 'Cash');
      setPaidStr(initialDraft.paidStr || '');
    }
  }, [initialDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft on any field change (debounced)
  const draftTimer = useRef(null);
  useEffect(() => {
    if (!open) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      // Only save if user has started filling something
      if (patientForm.name || selectedTests.length > 0) {
        saveDraft({
          step,
          patientForm,
          selectedTests,
          discountStr,
          discountType,
          paymentMode,
          paidStr,
          patientName: patientForm.name, // top-level for modal preview
        });
      }
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [step, patientForm, selectedTests, discountStr, discountType, paymentMode, paidStr, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Test search
  const filteredTests = invoiceCatalog.filter(t =>
    `${t.name} ${t.id}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTests.some(s => s.id === t.id)
  );

  const addTest    = (test) => { setSelectedTests(prev => [...prev, { ...test, overridePriceStr: String(test.price) }]); setSearchQuery(''); };
  const removeTest = (id)   => setSelectedTests(prev => prev.filter(t => t.id !== id));
  const updateOverride = (id, val) => setSelectedTests(prev => prev.map(t => t.id === id ? { ...t, overridePriceStr: val } : t));

  // Derived
  const discount       = Number(discountStr) || 0;
  const paidAmount     = Number(paidStr) || 0;
  const subtotal       = selectedTests.reduce((s, t) => s + (Number(t.overridePriceStr) || t.price || 0), 0);
  const discountAmount = discountType === 'percentage'
    ? subtotal * (Math.min(discount, 100) / 100)
    : Math.min(discount, subtotal);
  const taxableAmount  = subtotal - discountAmount;
  const gstAmount      = taxableAmount * GST_RATE;
  const grandTotal     = taxableAmount + gstAmount;
  const dueAmount      = Math.max(0, grandTotal - paidAmount);

  const validateAge = (v) => {
    if (v === '') return true;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n <= 150;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientForm.name.trim()) return toast.error('Please enter patient name');
    if (selectedTests.length === 0) return toast.error('Please select at least one test');
    if (paidStr === '' || paidAmount <= 0) return toast.error('Please enter paid amount');
    if (paidAmount > grandTotal) return toast.error('Paid amount cannot exceed grand total');
    if (discountType === 'percentage' && discount > 100) return toast.error('Discount cannot exceed 100%');

    onSave({
      patientName:  patientForm.name,
      age:          patientForm.age,
      gender:       patientForm.gender,
      phone:        patientForm.phone,
      doctor:       patientForm.doctor,
      address:      patientForm.address,
      selectedTests: selectedTests.map(t => ({ ...t, overridePrice: Number(t.overridePriceStr) || t.price })),
      subtotal, discountAmount, gstAmount, grandTotal, paidAmount, dueAmount,
      paymentMode, discount, discountType,
    });

    // Clear draft on successful submit
    clearDraft();
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setPatientForm(blankPatient);
    setSelectedTests([]);
    setDiscountStr('');
    setPaidStr('');
    setPaymentMode('Cash');
  };

  const resetAndClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Create New Invoice" size="xl">
      {/* Steps Indicator */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[{ n: 1, label: 'Patient' }, { n: 2, label: 'Tests' }, { n: 3, label: 'Payment' }].map(s => (
          <div key={s.n} className="flex items-center gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
              step >= s.n ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            }`}>
              {step > s.n ? <FiCheck size={14} /> : s.n}
            </span>
            <span className={`text-xs font-medium ${step >= s.n ? 'text-blue-600' : 'text-slate-400'}`}>{s.label}</span>
            {s.n < 3 && <div className={`h-0.5 w-6 sm:w-10 ${step > s.n ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="label">Patient Name *</span>
                <input className="field" value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} placeholder="Enter patient full name" required />
              </label>
              <label>
                <span className="label">Age (years)</span>
                <NumericInput value={patientForm.age} onChange={v => setPatientForm({ ...patientForm, age: v })} placeholder="e.g. 32" min={0} max={150} />
              </label>
              <label>
                <span className="label">Gender</span>
                <select className="field" value={patientForm.gender} onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </label>
              <label>
                <span className="label">Phone Number</span>
                <input className="field" value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 9876543210" maxLength={15} />
              </label>
              <label>
                <span className="label">Referring Doctor</span>
                <input className="field" value={patientForm.doctor} onChange={e => setPatientForm({ ...patientForm, doctor: e.target.value })} placeholder="Dr. Name" />
              </label>
              <label className="sm:col-span-2">
                <span className="label">Address</span>
                <textarea className="field h-16 resize-none" value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })} placeholder="Patient address..." />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => {
                if (!patientForm.name.trim()) return toast.error('Patient name is required');
                if (patientForm.age && !validateAge(patientForm.age)) return toast.error('Please enter a valid age (0–150)');
                setStep(2);
              }}>
                Next: Select Tests →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input className="field pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tests (CBC, LFT, KFT, Vitamin D, HbA1c...)" />
              {searchQuery && filteredTests.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {filteredTests.map(t => (
                    <button key={t.id} type="button" onClick={() => addTest(t)} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.id} · ₹{t.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">+ Add</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && filteredTests.length === 0 && (
                <p className="mt-2 text-xs text-slate-400 pl-1">No matching tests found.</p>
              )}
            </div>

            {selectedTests.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-2">Test</th>
                      <th className="px-4 py-2">Default</th>
                      <th className="px-4 py-2">Override Price (₹)</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {selectedTests.map(t => (
                      <tr key={t.id}>
                        <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{t.name}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">{formatCurrency(t.price)}</td>
                        <td className="px-4 py-2.5">
                          <NumericInput value={t.overridePriceStr} onChange={v => updateOverride(t.id, v)} placeholder={String(t.price)} min={0}
                            className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-blue-500" />
                        </td>
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => removeTest(t.id)} className="text-rose-500 hover:text-rose-700 transition-colors"><FiTrash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTests.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-10 text-center">
                <p className="text-sm text-slate-400">Search and add laboratory tests above.</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => {
                if (selectedTests.length === 0) return toast.error('Select at least one test');
                setStep(3);
              }}>
                Next: Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Discount</h3>
                <div className="flex gap-2">
                  <select className="field w-16" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                    <option value="percentage">%</option>
                    <option value="flat">₹</option>
                  </select>
                  <NumericInput value={discountStr} onChange={setDiscountStr} placeholder={discountType === 'percentage' ? '0–100' : '0'} min={0} max={discountType === 'percentage' ? 100 : subtotal} className="field" />
                </div>
              </div>
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment</h3>
                <select className="field" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                  {paymentModes.map(m => <option key={m}>{m}</option>)}
                </select>
                <NumericInput value={paidStr} onChange={setPaidStr} placeholder="Enter paid amount" min={0} max={grandTotal} className="field" />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal ({selectedTests.length} tests)</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
                    <span className="font-mono text-rose-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{formatCurrency(gstAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Grand Total</span>
                  <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span className="font-semibold">Paid</span>
                  <span className="font-mono">{formatCurrency(paidAmount)}</span>
                </div>
                {dueAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span className="font-semibold">Due</span>
                    <span className="font-mono">{formatCurrency(dueAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                <FiDollarSign /> Create Invoice
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
// Invoice Preview (Print/PDF)
// ─────────────────────────────────────────────────────────
function InvoicePreviewHTML({ invoice }) {
  return (
    <div id="invoice-preview" className="bg-white text-[#111827] mx-auto overflow-hidden" style={{ width: '794px', minHeight: '1123px', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      {/* HEADER */}
      <div className="flex items-start justify-between pb-6" style={{ borderBottom: '3px solid #1E40AF' }}>
        <div className="flex gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl" style={{ background: '#1E40AF' }}>
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>L</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>LabPro Diagnostics</h1>
            <p className="text-sm font-medium text-[#374151]">NABL-ready diagnostic laboratory</p>
            <p className="mt-1 text-xs text-[#6B7280]">24, Health Plaza, Bengaluru - 560001</p>
            <p className="text-xs text-[#6B7280]">+91 80 4567 8900 · info@labpro.in · www.labpro.in</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#1E40AF]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{invoice.invoiceNo}</p>
          <p className="text-xs font-medium text-[#374151]">Date: {invoice.date}</p>
          <div className="mt-2 inline-block rounded-lg px-3 py-1 text-xs font-semibold text-white" style={{ background: '#1E40AF' }}>TAX INVOICE</div>
        </div>
      </div>

      {/* PATIENT INFO */}
      <div className="patient-card mt-6 rounded-xl p-5" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 className="mb-4 text-sm font-semibold text-[#111827]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>PATIENT INFORMATION</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['Patient Name', invoice.patientName],
            ['Invoice No',   invoice.invoiceNo],
            ['Age / Gender', `${invoice.age || '—'} / ${invoice.gender || '—'}`],
            ['Date',         invoice.date],
            ['Phone',        invoice.phone || '—'],
            ['Doctor',       invoice.doctor || 'Self'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>{label}</span>
              <span className="text-[#374151] font-medium">: {value}</span>
            </div>
          ))}
          {invoice.address && (
            <div className="flex gap-2 col-span-2">
              <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>Address</span>
              <span className="text-[#374151] font-medium">: {invoice.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* TESTS TABLE */}
      <div className="mt-6">
        <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1E40AF' }}>
              {['#', 'Test Name', 'Department', 'Price (₹)', 'Amount (₹)'].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-white font-semibold text-xs uppercase tracking-wider ${i < 4 ? 'border-r border-blue-500' : ''} ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.selectedTests?.map((t, i) => (
              <tr key={t.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <td className="px-4 py-3 text-[#6B7280] text-xs font-medium">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-[#111827]">{t.name}</td>
                <td className="px-4 py-3 text-[#374151] text-xs">{t.department || '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-[#374151]">{formatCurrency(t.overridePrice || t.price)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-[#111827]">{formatCurrency(t.overridePrice || t.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY */}
      <div className="summary-card mt-6 ml-auto rounded-xl p-5" style={{ width: '320px', background: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)' }}>
        <h3 className="mb-4 text-sm font-semibold text-[#111827]" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>PAYMENT SUMMARY</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#374151]">Subtotal</span><span className="font-mono font-semibold text-[#111827]">{formatCurrency(invoice.subtotal)}</span></div>
          {(invoice.discountAmount || 0) > 0 && <div className="flex justify-between"><span className="text-[#374151]">Discount</span><span className="font-mono font-semibold text-[#DC2626]">-{formatCurrency(invoice.discountAmount)}</span></div>}
          <div className="flex justify-between"><span className="text-[#374151]">GST (18%)</span><span className="font-mono font-semibold text-[#374151]">{formatCurrency(invoice.gstAmount)}</span></div>
          <div className="flex justify-between pt-2" style={{ borderTop: '2px solid #1E40AF' }}>
            <span className="text-base font-bold text-[#111827]" style={{ fontFamily: "'Poppins', sans-serif" }}>Grand Total</span>
            <span className="font-mono text-xl font-bold text-[#111827]">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div className="flex justify-between"><span className="font-semibold text-[#059669]">Paid</span><span className="font-mono font-bold text-[#059669]">{formatCurrency(invoice.paidAmount)}</span></div>
          {(invoice.dueAmount || 0) > 0 && <div className="flex justify-between"><span className="font-semibold text-[#DC2626]">Due</span><span className="font-mono font-bold text-[#DC2626]">{formatCurrency(invoice.dueAmount)}</span></div>}
          <div className="flex justify-between text-xs"><span className="text-[#6B7280]">Payment Mode</span><span className="font-mono font-semibold text-[#374151]">{invoice.paymentMode}</span></div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12" style={{ borderTop: '1px solid #D1D5DB' }}>
        <div className="pt-4 text-center">
          <p className="text-xs text-[#6B7280] font-medium">This is a computer-generated invoice. Payment received. Thank you for choosing LabPro Diagnostics.</p>
          <p className="mt-2 text-xs text-[#6B7280] font-medium">LabPro Diagnostics · Confidential medical record · {invoice.invoiceNo}</p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]">© {new Date().getFullYear()} LabPro Diagnostics. All rights reserved. | Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Timeline Modal
// ─────────────────────────────────────────────────────────
function TimelineModal({ invoice, onClose, onUpdate }) {
  if (!invoice) return null;
  const currentStepIndex = timelineSteps.findIndex(s => invoice.timeline?.find(t => t.step === s.key && t.done));

  return (
    <Modal open={invoice !== null} onClose={onClose} title={`Report Status – ${invoice.invoiceNo}`} size="md">
      <div className="py-4">
        <p className="mb-4 text-sm text-slate-500">Track the progress of this invoice and report.</p>
        <div className="space-y-0">
          {timelineSteps.map((step, idx) => {
            const done = invoice.timeline?.find(t => t.step === step.key)?.done || false;
            const isCurrent = idx === currentStepIndex + 1;
            const canActivate = currentStepIndex === -1 || idx <= currentStepIndex + 1;
            return (
              <div key={step.key} className="timeline-dot">
                <button
                  onClick={() => canActivate && onUpdate(invoice.invoiceNo, step.key)}
                  disabled={!canActivate}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-all ${
                    done ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900/40' :
                    'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}
                >
                  {done ? <FiCheck size={12} /> : idx + 1}
                </button>
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-slate-800 dark:text-slate-200' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  {done && invoice.timeline?.find(t => t.step === step.key)?.date && (
                    <p className="text-xs text-slate-400">
                      {new Date(invoice.timeline.find(t => t.step === step.key).date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {isCurrent && !done && <p className="text-xs text-blue-400">Click to mark complete</p>}
                </div>
              </div>
            );
          })}
        </div>

        {currentStepIndex >= 2 && (
          <div className="mt-6 flex justify-center">
            <Link to="/reports/create" className="btn-primary" onClick={() => { toast.success(`Proceeding to generate report for ${invoice.patientName}`); onClose(); }}>
              <FiFileText /> Generate Report for {invoice.patientName}
            </Link>
          </div>
        )}
      </div>
    </Modal>
  );
}
