import { useState } from 'react';
import { FiDownload, FiEye, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ReportPreview from '../components/reports/ReportPreview';

const initialReports = [
  { id: 'RPT-240628', patient: 'Ananya Iyer', tests: 'CBC, LFT', date: '28 Jul 2026', status: 'Completed', amount: '₹1,240' },
  { id: 'RPT-240627', patient: 'Aarav Sharma', tests: 'CBC, KFT', date: '28 Jul 2026', status: 'In progress', amount: '₹1,350' },
  { id: 'RPT-240626', patient: 'Vikram Singh', tests: 'Thyroid Profile', date: '27 Jul 2026', status: 'Pending', amount: '₹850' },
  { id: 'RPT-240625', patient: 'Priya Nair', tests: 'Lipid Profile, HbA1c', date: '27 Jul 2026', status: 'Completed', amount: '₹1,680' },
  { id: 'RPT-240624', patient: 'Rohan Mehta', tests: 'KFT, Electrolytes', date: '26 Jul 2026', status: 'Completed', amount: '₹1,420' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = reports.filter(r =>
    `${r.id} ${r.patient} ${r.tests}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    setReports(prev => prev.filter(r => r.id !== deleteId));
    setConfirmOpen(false);
    setDeleteId(null);
    toast.success('Report removed');
  };

  const handleDownload = async (report) => {
    toast.success(`Downloading ${report.id}...`);
    try {
      const element = document.getElementById('report-preview');
      if (!element) {
        toast.error('Preview element not found');
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(`${report.id}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF generation failed');
    }
  };

  const handlePreview = (report) => {
    setPreviewReport(report);
    setPreviewOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Diagnostic reports"
        description="Track, validate and distribute all laboratory reports."
        action={
          <Link className="btn-primary w-full sm:w-auto" to="/reports/create">
            <FiPlus /> Create report
          </Link>
        }
      />
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search report ID or patient" />
          </div>
          <p className="text-xs text-slate-400">{filtered.length} reports</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                {['Report ID', 'Patient', 'Tests', 'Reported on', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-mono text-xs font-medium text-blue-600">{r.id}</td>
                  <td className="px-5 font-semibold text-slate-800 dark:text-slate-200">{r.patient}</td>
                  <td className="px-5 text-slate-500">{r.tests}</td>
                  <td className="px-5 text-slate-400">{r.date}</td>
                  <td className="px-5 font-mono text-slate-500">{r.amount}</td>
                  <td className="px-5"><StatusBadge status={r.status} /></td>
                  <td className="px-5">
                    <div className="flex gap-1">
                      <button onClick={() => handlePreview(r)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Preview">
                        <FiEye size={14} />
                      </button>
                      <button onClick={() => handleDownload(r)} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Download PDF">
                        <FiDownload size={14} />
                      </button>
                      <button onClick={() => { setDeleteId(r.id); setConfirmOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={previewReport?.id || 'Report preview'} size="xl">
        <div className="flex justify-center overflow-auto">
          <ReportPreview
            patient={{ name: previewReport?.patient || '', age: '—', gender: '—', patientId: 'PID-001', registrationNumber: previewReport?.id || '', barcodeNumber: 'BC-001', collectionDate: '—', receivedDate: '—', reportDate: previewReport?.date || '', doctor: '—', reportStatus: previewReport?.status || '' }}
            tests={[]}
            values={{}}
          />
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete report" message="This action cannot be undone." />
    </>
  );
}

