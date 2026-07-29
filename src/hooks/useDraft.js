/**
 * useDraft.js
 * ───────────
 * Hook for saving and recovering in-progress Invoice/Report drafts.
 *
 * Usage:
 *   const { hasDraft, draft, saveDraft, clearDraft } = useDraft('invoice');
 */

import { useCallback, useState } from 'react';
import draftService from '../services/draftService';

export function useDraft(type) {
  const [hasDraft, setHasDraft] = useState(() => draftService.hasDraft(type));
  const [draft, setDraft]       = useState(() => draftService.loadDraft(type));

  const saveDraft = useCallback((data) => {
    draftService.saveDraft(type, data);
    setHasDraft(true);
    setDraft(draftService.loadDraft(type));
  }, [type]);

  const clearDraft = useCallback(() => {
    draftService.clearDraft(type);
    setHasDraft(false);
    setDraft(null);
  }, [type]);

  return { hasDraft, draft, saveDraft, clearDraft };
}
