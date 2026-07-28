import { useState } from 'react';
import { FiPlus, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { testTemplates, testCatalog } from '../data/testTemplates';

export default function TestsPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  const all = [
    ...testTemplates,
    ...testCatalog.map((name, i) => ({
      id: `catalog-${i}`,
      name,
      code: name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      department: 'Configurable',
      parameters: [],
    })),
  ];

  const filtered = all.filter(t =>
    `${t.name} ${t.code} ${t.department}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <PageHeader
        title="Test catalogue"
        description="Configure laboratory investigations, departments and result templates."
        action={<button className="btn-primary"><FiPlus /> New test</button>}
      />
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="relative w-80">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="field pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..." />
          </div>
          <p className="text-xs text-slate-400">{filtered.length} active investigations</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map(t => (
            <div key={t.id}>
              <button
                onClick={() => t.parameters.length && toggleExpand(t.id)}
                className={`flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 ${t.parameters.length ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t.code} · {t.department} · {t.parameters.length || 'Configurable'} parameters
                    {t.specimen && ` · ${t.specimen}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-600">Configure</span>
                  {t.parameters.length > 0 && (
                    expanded[t.id] ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />
                  )}
                </div>
              </button>
              {expanded[t.id] && t.parameters.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/20">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 uppercase tracking-wide">
                      <tr>
                        <th className="py-1 pr-4">Parameter</th>
                        <th className="py-1 pr-4">Unit</th>
                        <th className="py-1 pr-4">Reference range</th>
                        <th className="py-1">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.parameters.map(p => (
                        <tr key={p.name} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="py-1.5 pr-4 font-medium text-slate-700 dark:text-slate-300">{p.name}</td>
                          <td className="py-1.5 pr-4 text-slate-500">{p.unit}</td>
                          <td className="py-1.5 pr-4 text-slate-500">{p.range}</td>
                          <td className="py-1.5 text-slate-500">{p.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {t.interpretation && (
                    <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <b>Interpretation:</b> {t.interpretation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

