import { QRCodeSVG } from 'qrcode.react';
import { resultStatus } from '../../utils/report';

// Barcode-like visual (since we can't render real barcodes without a library)
function BarcodeVisual({ code }) {
  const bars = [];
  const codeStr = String(code || 'LP-240629');
  for (let i = 0; i < 60; i++) {
    const width = 1 + Math.round(Math.random() * 2);
    const gap = 1 + Math.round(Math.random());
    bars.push(
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: `${width}px`,
          height: `${i % 3 === 0 ? 28 : 20}px`,
          background: '#111827',
          marginRight: `${gap}px`
        }}
      />
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center" style={{ gap: '0px' }}>
        {bars.slice(0, 40)}
      </div>
      <span className="text-[9px] font-mono text-[#6B7280] tracking-widest">{codeStr}</span>
    </div>
  );
}

function ResultValueCell({ value, status }) {
  const colors = {
    normal: '#059669',
    low: '#DC2626',
    high: '#D97706',
    critical: '#9D174D',
    pending: '#6B7280'
  };

  const bgColors = {
    normal: '#ECFDF5',
    low: '#FEF2F2',
    high: '#FFFBEB',
    critical: '#FDF2F8',
    pending: '#F9FAFB'
  };

  return (
    <span
      className="inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold"
      style={{
        color: colors[status] || '#111827',
        background: bgColors[status] || 'transparent'
      }}
    >
      {value}
    </span>
  );
}

export default function ReportPreview({ patient, tests, values }) {
  return (
    <div
      id="report-preview"
      className="bg-white text-[#111827] mx-auto"
      style={{
        width: '794px',
        minHeight: '1123px',
        fontFamily: "'Inter', 'Roboto', sans-serif",
        padding: '20mm'
      }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between pb-6" style={{ borderBottom: '3px solid #1E40AF' }}>
        <div className="flex gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: '#1E40AF'
            }}
          >
            <span
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
            >
              L
            </span>
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#111827]"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
            >
              LabPro Diagnostics
            </h1>
            <p className="text-sm font-medium text-[#374151]" style={{ fontWeight: 500 }}>
              NABL-ready diagnostic laboratory
            </p>
            <p className="mt-1 text-xs text-[#6B7280]" style={{ fontWeight: 400 }}>
              24, Health Plaza, Bengaluru - 560001
            </p>
            <p className="text-xs text-[#6B7280]" style={{ fontWeight: 400 }}>
              +91 80 4567 8900 · info@labpro.in · www.labpro.in
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <QRCodeSVG
            value={`https://labpro.example/report/${patient.registrationNumber || 'RPT-240629'}`}
            size={64}
            level="H"
          />
          <span className="text-[8px] text-[#6B7280] text-center" style={{ fontWeight: 400 }}>
            Scan to verify
          </span>
        </div>
      </div>

      {/* ===== BARCODE SECTION ===== */}
      <div className="mt-4 flex items-center justify-center py-2">
        <BarcodeVisual code={patient.barcodeNumber || patient.registrationNumber} />
      </div>

      {/* ===== REPORT TITLE ===== */}
      <div className="mt-4 text-center">
        <h2
          className="text-lg font-bold uppercase tracking-widest text-[#1E40AF]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
        >
          Diagnostic Laboratory Report
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-24" style={{ background: '#1E40AF' }} />
      </div>

      {/* ===== PATIENT INFORMATION CARD ===== */}
      <div
        className="patient-card mt-6 rounded-xl p-5"
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0'
        }}
      >
        <h3
          className="mb-4 text-sm font-semibold text-[#111827]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
        >
          PATIENT INFORMATION
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Patient Name
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.name || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Registration No
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.registrationNumber || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Patient ID
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.patientId || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Barcode No
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.barcodeNumber || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Age / Sex
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.age || '—'} / {patient.gender || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Referred By
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.doctor || 'Self'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Collected
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.collectionDate || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Received
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.receivedDate || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Reported
            </span>
            <span className="text-[#374151] font-medium" style={{ fontWeight: 500 }}>
              : {patient.reportDate || '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-[#111827]" style={{ fontWeight: 600, minWidth: 90 }}>
              Report Status
            </span>
            <span
              className="font-medium rounded px-2 py-0.5 text-xs"
              style={{
                color: patient.reportStatus === 'Final' ? '#059669' : patient.reportStatus === 'Preliminary' ? '#D97706' : '#6B7280',
                background: patient.reportStatus === 'Final' ? '#ECFDF5' : patient.reportStatus === 'Preliminary' ? '#FFFBEB' : '#F3F4F6'
              }}
            >
              : {patient.reportStatus || 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* ===== TEST RESULTS ===== */}
      {tests.length === 0 ? (
        <div className="mt-16 text-center text-sm text-[#6B7280] font-medium">
          Selected test results will appear here.
        </div>
      ) : (
        tests.map((test) => (
          <section key={test.id} className="mt-6">
            {/* Test Header */}
            <div className="pb-2" style={{ borderBottom: '2px solid #1E40AF' }}>
              <h2
                className="text-sm font-bold uppercase tracking-wider text-[#1E40AF]"
                style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
              >
                {test.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-0.5 text-[10px] text-[#6B7280]">
                <span style={{ fontWeight: 500 }}>
                  <span className="font-semibold text-[#374151]">Department:</span> {test.department}
                </span>
                <span style={{ fontWeight: 500 }}>
                  <span className="font-semibold text-[#374151]">Specimen:</span> {test.specimen || 'Serum'}
                </span>
                <span style={{ fontWeight: 500 }}>
                  <span className="font-semibold text-[#374151]">Method:</span> {test.method || 'As per parameter'}
                </span>
              </div>
            </div>

            {/* Results Table */}
            <div className="mt-3">
              <table
                className="w-full text-left"
                style={{ borderCollapse: 'collapse', fontSize: '9.5pt' }}
              >
                <thead>
                  <tr style={{ background: '#1E40AF' }}>
                    <th
                      className="px-3 py-2.5 text-white font-semibold uppercase tracking-wider"
                      style={{ fontWeight: 600, borderRight: '1px solid #2563EB', fontSize: '8.5pt' }}
                    >
                      Investigation
                    </th>
                    <th
                      className="px-3 py-2.5 text-white font-semibold uppercase tracking-wider"
                      style={{ fontWeight: 600, borderRight: '1px solid #2563EB', fontSize: '8.5pt' }}
                    >
                      Result
                    </th>
                    <th
                      className="px-3 py-2.5 text-white font-semibold uppercase tracking-wider"
                      style={{ fontWeight: 600, borderRight: '1px solid #2563EB', fontSize: '8.5pt' }}
                    >
                      Unit
                    </th>
                    <th
                      className="px-3 py-2.5 text-white font-semibold uppercase tracking-wider"
                      style={{ fontWeight: 600, borderRight: '1px solid #2563EB', fontSize: '8.5pt' }}
                    >
                      Reference Range
                    </th>
                    <th
                      className="px-3 py-2.5 text-white font-semibold uppercase tracking-wider"
                      style={{ fontWeight: 600, fontSize: '8.5pt' }}
                    >
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {test.parameters.map((parameter, index) => {
                    const value = values[`${test.id}.${index}`] || '—';
                    const status = resultStatus(value, parameter.range);
                    return (
                      <tr
                        key={parameter.name}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#F8FAFC',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        <td
                          className="px-3 py-2.5 font-semibold text-[#111827]"
                          style={{ fontWeight: 600 }}
                        >
                          {parameter.name}
                        </td>
                        <td className="px-3 py-2.5">
                          <ResultValueCell value={value} status={status} />
                        </td>
                        <td className="px-3 py-2.5 text-[#374151]" style={{ fontWeight: 500 }}>
                          {parameter.unit}
                        </td>
                        <td className="px-3 py-2.5 text-[#6B7280]" style={{ fontWeight: 400, fontSize: '8.5pt' }}>
                          {parameter.range}
                        </td>
                        <td className="px-3 py-2.5 text-[#6B7280]" style={{ fontWeight: 400, fontSize: '8pt' }}>
                          {parameter.method}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interpretation */}
            {test.interpretation && (
              <div
                className="mt-3 rounded-lg p-3 text-xs"
                style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD'
                }}
              >
                <span
                  className="font-semibold text-[#0369A1]"
                  style={{ fontWeight: 600 }}
                >
                  Interpretation:
                </span>{' '}
                <span className="text-[#0C4A6E]" style={{ fontWeight: 500 }}>
                  {test.interpretation}
                </span>
              </div>
            )}
          </section>
        ))
      )}

      {/* ===== COMMENTS SECTION ===== */}
      <div className="mt-6 rounded-lg p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#111827]"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
        >
          Comments
        </h3>
        <p className="text-xs text-[#6B7280]" style={{ fontWeight: 400, fontStyle: 'italic' }}>
          No additional comments.
        </p>
      </div>

      {/* ===== SIGNATURES ===== */}
      <div className="mt-10 grid grid-cols-2 gap-8">
        <div className="text-center">
          <div
            className="mx-auto mb-1 h-px w-48"
            style={{ borderTop: '1px dashed #D1D5DB' }}
          />
          <p className="text-xs font-semibold text-[#111827]" style={{ fontWeight: 600 }}>
            Dr. {patient.doctor || 'Physician'}
          </p>
          <p className="text-[10px] text-[#6B7280]" style={{ fontWeight: 400 }}>
            Referring Doctor
          </p>
        </div>
        <div className="text-center">
          <div
            className="mx-auto mb-1 h-px w-48"
            style={{ borderTop: '1px dashed #D1D5DB' }}
          />
          <p className="text-xs font-semibold text-[#111827]" style={{ fontWeight: 600 }}>
            Dr. Authorized Signatory
          </p>
          <p className="text-[10px] text-[#6B7280]" style={{ fontWeight: 400 }}>
            Pathologist / Lab Director
          </p>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-8" style={{ borderTop: '1px solid #D1D5DB' }}>
        <div className="pt-3 text-center">
          <p className="text-[10px] text-[#6B7280]" style={{ fontWeight: 500 }}>
            LabPro Diagnostics · Confidential Medical Record · Electronically generated report
          </p>
          <p className="mt-1 text-[10px] text-[#6B7280]" style={{ fontWeight: 500 }}>
            Please correlate clinically. This is a computer-generated report and does not require a physical signature.
          </p>
          <p className="mt-2 text-[9px] text-[#9CA3AF]" style={{ fontWeight: 400 }}>
            Page 1 of 1 · Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="mt-0.5 text-[9px] text-[#9CA3AF]" style={{ fontWeight: 400 }}>
            © {new Date().getFullYear()} LabPro Diagnostics. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

