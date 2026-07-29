/**
 * useReports.js
 * ─────────────
 * Convenience hook — extracts report slice from DataContext.
 */
import { useData } from '../context/DataContext';

export function useReports() {
  const { reports, addReport, updateReport, deleteReport } = useData();
  return { reports, addReport, updateReport, deleteReport };
}
