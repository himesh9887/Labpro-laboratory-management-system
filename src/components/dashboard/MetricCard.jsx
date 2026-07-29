import { motion } from 'framer-motion';

const TONES = {
  blue:   { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',   value: 'text-blue-700 dark:text-blue-300' },
  green:  { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', value: 'text-emerald-700 dark:text-emerald-300' },
  amber:  { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',  value: 'text-amber-700 dark:text-amber-300' },
  rose:   { icon: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',    value: 'text-rose-700 dark:text-rose-300' },
  violet: { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', value: 'text-violet-700 dark:text-violet-300' },
  slate:  { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',  value: 'text-slate-700 dark:text-slate-300' },
};

/**
 * MetricCard
 * @param {string}   label       — card title
 * @param {string}   value       — primary metric (large)
 * @param {string}   trend       — secondary info line (no "from last week" suffix)
 * @param {Function} icon        — react-icon component
 * @param {string}   tone        — 'blue' | 'green' | 'amber' | 'rose' | 'violet' | 'slate'
 * @param {Array}    breakdown   — optional [{label, value, color?}] for sub-rows
 */
export default function MetricCard({ label, value, trend, icon: Icon, tone = 'blue', breakdown }) {
  const t = TONES[tone] || TONES.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card p-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className={`mt-2 font-mono text-2xl font-bold leading-none ${t.value}`}>
            {value}
          </p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.icon}`}>
          <Icon size={20} />
        </span>
      </div>

      {/* Trend */}
      {trend && (
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {trend}
        </p>
      )}

      {/* Optional breakdown rows */}
      {breakdown && breakdown.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          {breakdown.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                {row.color && (
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                )}
                {row.label}
              </span>
              <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
