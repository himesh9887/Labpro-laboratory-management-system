import { useState, useMemo } from 'react';
import { FiChevronDown, FiChevronUp, FiChevronsLeft, FiChevronsRight, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';

export default function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  actions,
  onRowClick,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div className="card overflow-hidden">
      {searchable && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="field pl-9"
            />
          </div>
          <p className="text-xs text-slate-400">{sorted.length} record{sorted.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={`px-5 py-3 font-semibold ${col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.accessor && (
                      sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-5 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-12 text-center text-sm text-slate-400">
                  No records found.
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-slate-50/70 dark:hover:bg-slate-800/30`}
                >
                  {columns.map((col) => (
                    <td key={col.accessor || col.header} className={`px-5 py-4 ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-700">
          <p className="text-xs text-slate-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800">
              <FiChevronsLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800">
              <FiChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const num = start + i;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${page === num ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {num + 1}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800">
              <FiChevronRight size={14} />
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800">
              <FiChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

