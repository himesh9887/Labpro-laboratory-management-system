import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { resultStatus } from '../../utils/report';

// ─── A4 constants (96 dpi) ──────────────────────────────
const A4_W_PX = 794;   // 210 mm
const A4_H_PX = 1123;  // 297 mm
const PAD_MM = 18;     // inner paper padding

// ─── Deterministic barcode ──────────────────────────────
const BarcodeVisual = memo(function BarcodeVisual({ code }) {
  const codeStr = String(code || 'LP-000001');
  const bars = Array.from({ length: 55 }, (_, i) => {
    const seed = codeStr.charCodeAt(i % codeStr.length) + i;
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: `${1 + (seed % 3)}px`,
          height: `${i % 4 === 0 ? 30 : 20}px`,
          background: '#111827',
          marginRight: `${1 + (seed % 2)}px`,
          verticalAlign: 'bottom',
        }}
      />
    );
  });
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>{bars}</div>
      <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#6B7280', letterSpacing: '0.15em' }}>
        {codeStr}
      </span>
    </div>
  );
});

// ─── Colour-coded result value ──────────────────────────
const ResultValueCell = memo(function ResultValueCell({ value, status }) {
  const fg = { normal: '#059669', low: '#DC2626', high: '#D97706', critical: '#9D174D', pending: '#6B7280' };
  const bg = { normal: '#ECFDF5', low: '#FEF2F2', high: '#FFFBEB', critical: '#FDF2F8', pending: '#F9FAFB' };
  return (
    <span style={{
      display: 'inline-block', borderRadius: '4px', padding: '1px 6px',
      fontFamily: 'monospace', fontSize: '9.5pt', fontWeight: 600,
      color: fg[status] || '#111827', background: bg[status] || 'transparent',
    }}>
      {value}
    </span>
  );
});

// ─── Individual test section ────────────────────────────
const TestSection = memo(function TestSection({ test, values }) {
  return (
    <section style={{ marginTop: '86px' }}>
      <div style={{ paddingBottom: '6px', borderBottom: '2px solid #1E40AF' }}>
        <h2 style={{ margin: 0, fontSize: '9.5pt', fontWeight: 700, color: '#1E40AF', fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {test.name}
        </h2>
        <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '0 20px', fontSize: '8pt', color: '#6B7280' }}>
          <span><span style={{ fontWeight: 600, color: '#374151' }}>Department:</span> {test.department}</span>
          <span><span style={{ fontWeight: 600, color: '#374151' }}>Specimen:</span> {test.specimen || 'Serum'}</span>
          <span><span style={{ fontWeight: 600, color: '#374151' }}>Method:</span> {test.method || 'As per parameter'}</span>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt', marginTop: '8px', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '28%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '14%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#1E40AF' }}>
            {['Investigation', 'Result', 'Unit', 'Reference Range', 'Method'].map((h, i) => (
              <th key={h} style={{ padding: '7px 10px', color: '#fff', fontWeight: 600, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderRight: i < 4 ? '1px solid #2563EB' : 'none', wordBreak: 'break-word' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {test.parameters.map((p, idx) => {
            const value = values[`${test.id}.${idx}`] || '—';
            const status = resultStatus(value, p.range);
            return (
              <tr key={p.name || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '7px 10px', fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>{p.name}</td>
                <td style={{ padding: '7px 10px' }}><ResultValueCell value={value} status={status} /></td>
                <td style={{ padding: '7px 10px', color: '#374151', fontWeight: 500, wordBreak: 'break-word' }}>{p.unit}</td>
                <td style={{ padding: '7px 10px', color: '#6B7280', fontSize: '8.5pt', wordBreak: 'break-word' }}>{p.range}</td>
                <td style={{ padding: '7px 10px', color: '#6B7280', fontSize: '8pt', wordBreak: 'break-word' }}>{p.method}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {test.interpretation && (
        <div style={{ marginTop: '8px', borderRadius: '6px', padding: '8px 12px', background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: '8.5pt' }}>
          <span style={{ fontWeight: 600, color: '#0369A1' }}>Interpretation: </span>
          <span style={{ fontWeight: 500, color: '#0C4A6E' }}>{test.interpretation}</span>
        </div>
      )}
    </section>
  );
});

// ─── The real A4 report document ───────────────────────
// Kept as a pure, memoized component. Everything inside uses
// inline styles so nothing leaks from Tailwind or dark-mode.
export const ReportDocument = memo(function ReportDocument({ patient, tests, values }) {
  return (
    <div
      id="report-preview"
      style={{
        width: `${A4_W_PX}px`,
        minHeight: `${A4_H_PX}px`,
        background: '#ffffff',
        fontFamily: "'Inter', 'Roboto', sans-serif",
        padding: `${PAD_MM}mm`,
        boxSizing: 'border-box',
        color: '#111827',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '3px solid #1E40AF' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif" }}>L</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20pt', fontWeight: 700, color: '#111827', fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}>LabPro Diagnostics</h1>
            <p style={{ margin: '2px 0 0', fontSize: '9pt', fontWeight: 500, color: '#374151' }}>NABL-ready diagnostic laboratory</p>
            <p style={{ margin: '4px 0 0', fontSize: '8pt', fontWeight: 400, color: '#6B7280' }}>24, Health Plaza, Bengaluru - 560001</p>
            <p style={{ margin: '1px 0 0', fontSize: '8pt', fontWeight: 400, color: '#6B7280' }}>+91 80 4567 8900 · info@labpro.in · www.labpro.in</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <QRCodeSVG
            value={`https://labpro.example/report/${patient.registrationNumber || 'RPT-000001'}`}
            size={64} level="H" style={{ display: 'block' }}
          />
          <span style={{ fontSize: '7pt', color: '#9CA3AF', textAlign: 'center' }}>Scan to verify</span>
        </div>
      </div>

      {/* BARCODE */}
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <BarcodeVisual code={patient.barcodeNumber || patient.registrationNumber || 'LP-000001'} />
      </div>

      {/* REPORT TITLE */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '12pt', fontWeight: 700, color: '#1E40AF', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Diagnostic Laboratory Report
        </h2>
        <div style={{ width: '80px', height: '2px', background: '#1E40AF', margin: '6px auto 0' }} />
      </div>

      {/* PATIENT INFO */}
      <div style={{ marginTop: '14px', borderRadius: '10px', padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '8.5pt', fontWeight: 600, color: '#111827', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Patient Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 32px', fontSize: '9pt' }}>
          {[
            ['Patient Name', patient.name || '—'],
            ['Registration No', patient.registrationNumber || '—'],
            ['Patient ID', patient.patientId || '—'],
            ['Barcode No', patient.barcodeNumber || '—'],
            ['Age / Sex', `${patient.age || '—'} / ${patient.gender || '—'}`],
            ['Referred By', patient.doctor || 'Self'],
            ['Collected', patient.collectionDate || '—'],
            ['Received', patient.receivedDate || '—'],
            ['Reported', patient.reportDate || '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: '#111827', minWidth: '100px', flexShrink: 0 }}>{label}</span>
              <span style={{ fontWeight: 500, color: '#374151' }}>: {val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#111827', minWidth: '100px', flexShrink: 0 }}>Report Status</span>
            <span style={{
              fontWeight: 600, fontSize: '8pt', padding: '1px 8px', borderRadius: '999px',
              color: patient.reportStatus === 'Final' ? '#059669' : patient.reportStatus === 'Preliminary' ? '#D97706' : '#6B7280',
              background: patient.reportStatus === 'Final' ? '#ECFDF5' : patient.reportStatus === 'Preliminary' ? '#FFFBEB' : '#F3F4F6',
            }}>
              : {patient.reportStatus || 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* TEST RESULTS */}
      <div style={{ flex: 1 }}>
        {tests.length === 0 ? (
          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '9.5pt', color: '#9CA3AF', fontStyle: 'italic' }}>
            Select laboratory tests to view results here.
          </div>
        ) : (
          tests.map(test => <TestSection key={test.id} test={test} values={values} />)
        )}
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: '16px', borderRadius: '8px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '8pt', fontWeight: 600, color: '#111827', fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>Comments</h3>
        <p style={{ margin: 0, fontSize: '8.5pt', color: '#6B7280', fontStyle: 'italic' }}>No additional comments.</p>
      </div>

      {/* SIGNATURES */}
      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {[
          [`Dr. ${patient.doctor || 'Physician'}`, 'Referring Doctor'],
          ['Dr. Authorized Signatory', 'Pathologist / Lab Director'],
        ].map(([name, title]) => (
          <div key={name} style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px dashed #D1D5DB', width: '160px', margin: '0 auto 6px' }} />
            <p style={{ margin: 0, fontSize: '8.5pt', fontWeight: 600, color: '#111827' }}>{name}</p>
            <p style={{ margin: '2px 0 0', fontSize: '8pt', fontWeight: 400, color: '#6B7280' }}>{title}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #D1D5DB', paddingTop: '10px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '8pt', fontWeight: 500, color: '#6B7280' }}>
          LabPro Diagnostics · Confidential Medical Record · Electronically generated report
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '8pt', fontWeight: 400, color: '#6B7280' }}>
          Please correlate clinically. This is a computer-generated report and does not require a physical signature.
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '7.5pt', color: '#9CA3AF' }}>
          Page 1 of 1 · Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '7.5pt', color: '#9CA3AF' }}>
          © {new Date().getFullYear()} LabPro Diagnostics. All rights reserved.
        </p>
      </div>
    </div>
  );
});

// ─── A4 Preview Panel ───────────────────────────────────
// Fills its flex parent entirely. Internally: fixed toolbar + scrollable paper area.
// The paper is rendered at 794px then shrunk with CSS transform: scale().
function A4PreviewPanel({ patient, tests, values }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.55);

  const recalcScale = useCallback(() => {
    if (!containerRef.current) return;
    // subtract horizontal padding (2 × 20 px = 40 px)
    const availW = containerRef.current.clientWidth - 40;
    setScale(Math.min(Math.max(availW / A4_W_PX, 0.25), 1));
  }, []);

  useEffect(() => {
    recalcScale();
    const ro = new ResizeObserver(recalcScale);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [recalcScale]);

  // The outer "placeholder" div must match scaled dimensions
  // so the scroll container knows the true content height.
  const scaledW = Math.round(A4_W_PX * scale);
  const scaledH = Math.round(A4_H_PX * scale);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: 'transparent',
      }}
    >
      {/* ── Toolbar ── */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
          Live Preview
        </span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', background: '#E5E7EB', borderRadius: '6px', padding: '2px 8px' }}>
          A4 · {Math.round(scale * 100)}%
        </span>
      </div>

      {/* ── Scrollable paper area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '0 20px 20px' }}>
        {/*
          Placeholder sized to SCALED dimensions. Without this the scroll
          container has no height information.
          The real A4 paper lives absolutely inside at full (794px) width,
          then visually squished by transform: scale().
        */}
        <div style={{ width: `${scaledW}px`, height: `${scaledH}px`, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              width: `${A4_W_PX}px`,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              position: 'absolute',
              top: 0,
              left: 0,
              boxShadow: '0 4px 32px rgba(15,23,42,.22), 0 1px 6px rgba(15,23,42,.10)',
              borderRadius: '3px',
            }}
          >
            <ReportDocument patient={patient} tests={tests} values={values} />
          </div>
        </div>
        {/* Bottom breathing room */}
        <div style={{ height: '20px' }} />
      </div>
    </div>
  );
}

// ─── Default export (used by ReportsPage preview modal) ─
export default function ReportPreview({ patient, tests, values }) {
  return <ReportDocument patient={patient} tests={tests} values={values} />;
}

// Named export used by CreateReportPage
export { A4PreviewPanel };
