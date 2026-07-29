/**
 * useSettings.js
 * ──────────────
 * Convenience hook — extracts settings slice from DataContext.
 */
import { useData } from '../context/DataContext';

export function useSettings() {
  const { settings, updateSettings } = useData();
  return { settings, updateSettings };
}
