/**
 * usePatients.js
 * ──────────────
 * Convenience hook — extracts patient slice from DataContext.
 */
import { useData } from '../context/DataContext';

export function usePatients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  return { patients, addPatient, updatePatient, deletePatient };
}
