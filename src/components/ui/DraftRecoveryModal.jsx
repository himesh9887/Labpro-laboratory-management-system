/**
 * DraftRecoveryModal.jsx
 * ──────────────────────
 * Shown at app load when an unsaved Invoice or Report draft is detected.
 * Asks the user: "Continue Draft" or "Discard Draft".
 */

import { FiAlertCircle, FiFileText, FiTrash2 } from 'react-icons/fi';

function formatSavedAt(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * @param {Object}   props
 * @param {'invoice'|'report'} props.type
 * @param {Object}   props.draft     — { data, savedAt }
 * @param {Function} props.onContinue
 * @param {Function} props.onDiscard
 */
export default function DraftRecoveryModal({ type, draft, onContinue, onDiscard }) {
  if (!draft) return null;

  const label = type === 'invoice' ? 'Invoice' : 'Report';
  const savedAt = formatSavedAt(draft.savedAt);

  return (
    /* Overlay */
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
         style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl"
        style={{ border: '1px solid #E2E8F0' }}
      >
        {/* Top stripe */}
        <div className="rounded-t-2xl px-6 py-4" style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A' }}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white shrink-0">
              <FiAlertCircle size={20} />
            </span>
            <div>
              <p className="font-semibold text-amber-900">Unsaved {label} draft found</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {savedAt ? `Last saved ${savedAt}` : 'Would you like to continue editing?'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            It looks like you were working on a new <strong className="text-slate-800 dark:text-slate-200">{label}</strong> but didn't finish.
            Your progress has been saved automatically.
          </p>
          {type === 'invoice' && draft.data?.patientName && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <FiFileText className="text-blue-500 shrink-0" size={15} />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{draft.data.patientName}</p>
                <p className="text-xs text-slate-400">
                  Step {draft.data.step || 1} of 3
                  {draft.data.selectedTests?.length > 0 && ` · ${draft.data.selectedTests.length} test(s)`}
                </p>
              </div>
            </div>
          )}
          {type === 'report' && draft.data?.patient?.name && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <FiFileText className="text-violet-500 shrink-0" size={15} />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{draft.data.patient.name || 'Unnamed patient'}</p>
                <p className="text-xs text-slate-400">
                  {draft.data.tests?.length > 0
                    ? `${draft.data.tests.length} test(s) loaded`
                    : 'Patient details filled'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={onDiscard}
            className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
          >
            <FiTrash2 size={14} /> Discard Draft
          </button>
          <button
            onClick={onContinue}
            className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiFileText size={14} /> Continue Draft
          </button>
        </div>
      </div>
    </div>
  );
}
