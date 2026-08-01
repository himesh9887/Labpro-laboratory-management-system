/**
 * useDraft.js
 * ───────────
 * Hook for saving and recovering in-progress Invoice/Report drafts.
 * Uses lab-scoped storage so drafts from LAB001 never appear in LAB002.
 *
 * Usage:
 *   const { hasDraft, draft, saveDraft, clearDraft } = useDraft('invoice');
 */

import { useCallback, useMemo, useState } from 'react';
import { createDraftService } from '../services/draftService';
import { useAuth } from '../context/AuthContext';

export function useDraft(type) {
  const { scopedStorage } = useAuth();

  // Create a scoped draft service instance
  const draftSvc = useMemo(
    () => scopedStorage ? createDraftService(scopedStorage) : null,
    [scopedStorage]
  );

  const [hasDraft, setHasDraft] = useState(() => draftSvc ? draftSvc.hasDraft(type) : false);
  const [draft,    setDraft]    = useState(() => draftSvc ? draftSvc.loadDraft(type) : null);

  const saveDraft = useCallback((data) => {
    if (!draftSvc) return;
    draftSvc.saveDraft(type, data);
    setHasDraft(true);
    setDraft(draftSvc.loadDraft(type));
  }, [draftSvc, type]);

  const clearDraft = useCallback(() => {
    if (!draftSvc) return;
    draftSvc.clearDraft(type);
    setHasDraft(false);
    setDraft(null);
  }, [draftSvc, type]);

  return { hasDraft, draft, saveDraft, clearDraft };
}
