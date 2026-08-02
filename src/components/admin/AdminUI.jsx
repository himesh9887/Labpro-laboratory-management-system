/**
 * AdminUI.jsx
 * ───────────
 * Shared UI primitives for the Super Admin panel (dark theme).
 * Kept minimal & consistent with the existing design language.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/* ── Page header ─────────────────────────────────────── */
export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-blue-400">LabPro LIMS</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────── */
export function AdminStatCard({ label, value, sub, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose:   'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-bold leading-none text-white">{value}</p>
          {sub && <p className="mt-2 text-xs font-medium text-slate-400 truncate">{sub}</p>}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.blue}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

/* ── Status pill ─────────────────────────────────────── */
const STATUS_STYLES = {
  Active:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Inactive:  'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Suspended: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Expired:   'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Deleted:   'bg-slate-500/15 text-slate-500 border-slate-500/30',
  Paid:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Pending:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${STATUS_STYLES[status] || STATUS_STYLES.Inactive}`}>
      {status}
    </span>
  );
}

/* ── Modal ───────────────────────────────────────────── */
export function AdminModal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl`}
          >
            {title && (
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Confirm dialog ──────────────────────────────────── */
export function AdminConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  const btnStyles = variant === 'danger'
    ? 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200'
    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-500/15 text-rose-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{message}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${btnStyles}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Empty state ─────────────────────────────────────── */
export function AdminEmpty({ icon: Icon, msg, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-slate-500">
        <Icon size={22} />
      </span>
      <p className="text-sm font-semibold text-slate-400">{msg}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────── */
export function AdminField({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export const adminInputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-900/30';

export const adminBtnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition-all hover:from-amber-600 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50';

export const adminBtnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50';

