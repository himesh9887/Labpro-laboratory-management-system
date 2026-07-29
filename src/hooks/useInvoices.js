/**
 * useInvoices.js
 * ──────────────
 * Convenience hook — extracts invoice slice from DataContext.
 */
import { useData } from '../context/DataContext';

export function useInvoices() {
  const { invoices, addInvoice, deleteInvoice, updateTimeline } = useData();
  return { invoices, addInvoice, deleteInvoice, updateTimeline };
}
