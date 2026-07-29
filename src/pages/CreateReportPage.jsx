import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiChevronDown, FiFileText, FiMaximize2, FiPrinter,
  FiSave, FiTrash2, FiUser, FiX,
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import PageHeader from '../components/common/PageHeader';
import ResultTable from '../components/reports/ResultTable';
import { A4PreviewPanel, ReportDocument } from '../components/reports/ReportPreview';
import TestSearch from '../components/reports/TestSearch';
import DraftRecoveryModal from '../components/ui/DraftRecoveryModal';
import { patients as mockPatients } from '../data/mockData';
import { allTests } from '../data/testTemplates';
import { useReports } from '../hooks/useReports';
import { usePatients } from '../hooks/usePatients';
import { useDraft } from '../hooks/useDraft';

// ─── Constants ───────────────────────────────────────────
const STICKY_TOP = 73 + 28; // 101px

const blank = {
  name: '', age: '', gender: 'Female',
  patientId: '', registrationNumber: '', barcodeNumber: '',
  collectionDate: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  receivedDate:   new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  reportDate:     new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  doctor: '', reportStatus: 'Draft',
};

const PATIENT_FIELDS = [
  ['name',               'Patient Name'],
  ['age',                'Age'],
  ['patientId',          'Patient ID'],
  ['registrationNumber', 'Registration No.'],
  ['barcodeNumber',      'Barcode Number'],
  ['collectionDate',     'Collection Date'],
  ['receivedDate',       'Received Date'],
  ['reportDate',         'Report Date'],
  ['doctor',             'Referring Doctor'],
];

// ─── Mobile fullscreen preview modal ─────────────────────
function MobilePreviewModal({ patient, tests, values, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col xl:hidden" style={{ background: '#111827' }}>
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #374151', background: '#1F2937' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white">
            <FiFileText size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Report Preview</p>
            <p className="text-[10px] text-slate-400">A4 · Live update</p>
          </div>
          <span
            className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: 'rgba(34,197,94,.15)', color: '#4ade80' }}
          >
            ● Live
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          style={{ border: '1px solid #374151', background: '#374151' }}
        >
          <FiX size={13} /> Close
        </button>
      </div>
      <div className="min-h-0 flex-1" style={{ background: '#1F2937' }}>
        <A4PreviewPanel patient={patient} tests={tests} values={values} />
      </div>
    </div>
  );
}

// ─── Sticky preview panel (xl desktop only) ──────────────
function StickyPreviewPanel({ patient, tests, values }) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: `${STICKY_TOP}px`,
        height: `calc(100vh - ${STICKY_TOP}px - 28px)`,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div
        className="flex shrink-0 items-center gap-2 rounded-t-2xl px-4 py-2.5"
        style={{ border: '1px solid #E2E8F0', borderBottom: 'none', background: '#ffffff' }}
      >
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <FiFileText size={13} />
        </span>
        <span className="text-xs font-semibold text-slate-600">Report Preview</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold"
          style={{ background: 'rgba(34,197,94,.12)', color: '#16a34a' }}
        >
          ● Live
        </span>
      </div>
      <div
        className="dark:border-slate-700 min-h-0 flex-1 rounded-b-2xl"
        style={{ border: '1px solid #E2E8F0', background: '#F3F4F6', overflow: 'hidden' }}
      >
        <A4PreviewPanel patient={patient} tests={tests} values={values} />
      </div>
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function CreateReportPage() {
  const { addReport } = useReports();
  const { patients: storedPatients } = usePatients();
  const { hasDraft, draft, saveDraft, clearDraft } = useDraft('report');

  // Combine stored patients with mock data for lookup
  const allPatients = useMemo(() => {
    const stored = storedPatients || [];
    const ids = new Set(stored.map(p => p.id));
    return [...stored, ...mockPatients.filter(p => !ids.has(p.id))];
  }, [storedPatients]);

  // Restore from draft or start blank
  const [patient, setPatient]     = useState(() => draft?.data?.patient || blank);
  const [selected, setSelected]   = useState(() => draft?.data?.tests   || []);
  const [values,   setValues]     = useState(() => draft?.data?.values  || {});

  const [patientQuery, setPatientQuery] = useState('');
  const [query,        setQuery]        = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showDraftModal,    setShowDraftModal]    = useState(hasDraft);

  // Auto-save draft (debounced 500ms)
  const draftTimer = useRef(null);
  useEffect(() => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (patient.name || selected.length > 0) {
        saveDraft({ patient, tests: selected, values });
      }
    }, 500);
    return () => clearTimeout(draftTimer.current);
  }, [patient, selected, values]); // eslint-disable-line react-hooks/exhaustive-deps

  const available = useMemo(
    () => allTests.filter(
      t => `${t.name} ${t.code || ''}`.toLowerCase().includes(query.toLowerCase()) &&
           !selected.some(s => s.id === t.id)
    ),
    [query, selected]
  );

  const patientMatches = allPatients.filter(p =>
    patientQuery &&
    `${p.name} ${p.id} ${p.phone}`.toLowerCase().includes(patientQuery.toLowerCase())
  );

  const field = useCallback((key, val) => setPatient(p => ({ ...p, [key]: val })), []);

  const select = useCallback((test) => {
    if (!test.parameters?.length) {
      toast('This test has no parameters configured yet.');
      return;
    }
    setSelected(prev => [...prev, test]);
    setQuery('');
  }, []);

  const clear = useCallback(() => {
    setPatient(blank);
    setSelected([]);
    setValues({});
    setQuery('');
    clearDraft();
    toast.success('Form cleared');
  }, [clearDraft]);

  const handleChange = useCallback((key, val) => setValues(v => ({ ...v, [key]: val })), []);
  const handleRemove = useCallback((id) => setSelected(s => s.filter(x => x.id !== id)), []);

  const generateReport = useCallback(() => {
    if (!patient.name.trim()) {
      toast.error('Please enter a patient name');
      return;
    }
    if (selected.length === 0) {
      toast.error('Please select at least one test');
      return;
    }
    const report = addReport({
      patient: patient.name,
      tests: selected.map(t => t.name).join(', '),
      status: patient.reportStatus || 'Draft',
      amount: '—',
      patientData: patient,
      testData: selected,
      resultValues: values,
    });
    clearDraft();
    toast.success(`Report ${report.id} saved successfully!`);
  }, [patient, selected, values, addReport, clearDraft]);

  const downloadPDF = async () => {
    const el = document.getElementById('report-preview-pdf');
    if (!el) { toast.error('Preview not found'); return; }
    toast.loading('Generating PDF…');
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(`LabPro-${patient.registrationNumber || 'report'}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded');
    } catch {
      toast.dismiss();
      toast.error('PDF generation failed');
    }
  };

  // Draft recovery handlers
  const handleContinueDraft = () => {
    setShowDraftModal(false);
    if (draft?.data) {
      setPatient(draft.data.patient || blank);
      setSelected(draft.data.tests || []);
      setValues(draft.data.values || {});
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftModal(false);
    setPatient(blank);
    setSelected([]);
    setValues({});
  };

  return (
    <>
      {/* Draft recovery modal */}
      {showDraftModal && (
        <DraftRecoveryModal
          type="report"
          draft={draft}
          onContinue={handleContinueDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Hidden A4 document for PDF export */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none', zIndex: -1 }}>
        <div id="report-preview-pdf">
          <ReportDocument patient={patient} tests={selected} values={values} />
        </div>
      </div>

      {/* Mobile fullscreen preview modal */}
      {showMobilePreview && (
        <MobilePreviewModal
          patient={patient}
          tests={selected}
          values={values}
          onClose={() => setShowMobilePreview(false)}
        />
      )}

      {/* ─── Page Header ─── */}
      <PageHeader
        title="Create Diagnostic Report"
        description="Fill in patient details, select a laboratory test, and record validated results."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary xl:hidden w-full sm:w-auto"
              onClick={() => setShowMobilePreview(true)}
            >
              <FiMaximize2 size={14} /> Preview Report
            </button>
            <button
              className="btn-secondary w-full sm:w-auto"
              onClick={() => { saveDraft({ patient, tests: selected, values }); toast.success('Draft saved'); }}
            >
              <FiSave size={14} /> Save Draft
            </button>
            <button className="btn-primary w-full sm:w-auto" onClick={downloadPDF}>
              <FiPrinter size={14} /> Download PDF
            </button>
          </div>
        }
      />

      <div className="flex gap-6 items-start">

        {/* ══ LEFT COLUMN — form (full width) ══ */}
        <div className="min-w-0 flex-1 w-full space-y-5">

          {/* Patient Details */}
          <section className="card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FiUser size={15} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Patient Details</h2>
                <p className="text-xs text-slate-400">All fields update the preview in real time.</p>
              </div>
            </div>

            {/* Quick patient lookup */}
            <div className="relative mb-3">
              <input
                className="field"
                placeholder="Find existing patient by name, ID or mobile…"
                value={patientQuery}
                onChange={e => setPatientQuery(e.target.value)}
              />
              {patientMatches.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  {patientMatches.map(p => (
                    <button
                      key={p.id}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={() => {
                        setPatient({
                          ...blank,
                          name: p.name, age: String(p.age || ''), gender: p.gender || 'Female',
                          patientId: p.id, registrationNumber: p.id,
                          barcodeNumber: `BC-${p.id.slice(-6)}`,
                          doctor: p.doctor || '',
                        });
                        setPatientQuery('');
                      }}
                    >
                      <span>
                        <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                        <span className="text-xs text-slate-400">{p.id} · {p.phone}</span>
                      </span>
                      <span className="text-xs font-semibold text-blue-600">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient fields */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PATIENT_FIELDS.map(([key, label]) => (
                <label key={key}>
                  <span className="label">{label}</span>
                  <input
                    className="field"
                    value={patient[key]}
                    onChange={e => field(key, e.target.value)}
                  />
                </label>
              ))}
              <label>
                <span className="label">Gender</span>
                <select className="field" value={patient.gender} onChange={e => field('gender', e.target.value)}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                <span className="label">Report Status</span>
                <select className="field" value={patient.reportStatus} onChange={e => field('reportStatus', e.target.value)}>
                  <option>Draft</option>
                  <option>Preliminary</option>
                  <option>Final</option>
                </select>
              </label>
            </div>
          </section>

          {/* Test Search */}
          <TestSearch
            query={query}
            onQueryChange={setQuery}
            tests={available}
            onSelect={select}
          />

          {/* Result tables */}
          {selected.length > 0 ? (
            selected.map(test => (
              <ResultTable
                key={test.id}
                test={test}
                values={values}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center dark:border-slate-700">
              <FiChevronDown className="mx-auto mb-2 text-2xl text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">Search for a test above to load its template.</p>
              <p className="mt-1 text-xs text-slate-400/70">Results update the preview instantly.</p>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <button className="btn-secondary w-full sm:w-auto" onClick={clear}>
              <FiTrash2 size={14} /> Clear Form
            </button>
            <button
              className="btn-secondary xl:hidden w-full sm:w-auto"
              onClick={() => setShowMobilePreview(true)}
            >
              <FiFileText size={14} /> Preview Report
            </button>
            <button
              className="btn-secondary w-full sm:w-auto"
              onClick={generateReport}
            >
              Generate Report
            </button>
            <button className="btn-primary w-full sm:w-auto" onClick={downloadPDF}>
              <FiPrinter size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* ══ RIGHT COLUMN — hidden (preview accessible via modal) ══ */}
      </div>
    </>
  );
}