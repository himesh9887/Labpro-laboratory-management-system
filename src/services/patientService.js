/**
 * patientService.js
 * ─────────────────
 * CRUD for patient records with retention-based pruning.
 * Factory: call createPatientService(scopedStorage) for a lab-scoped instance.
 * Key: patients
 */

export function createPatientService(storage) {
  const KEY = 'patients';

  return {
    loadPatients() {
      return storage.get(KEY, []);
    },

    savePatients(arr) {
      storage.set(KEY, arr);
    },

    addPatient(patient) {
      const patients = this.loadPatients();
      const record = {
        ...patient,
        id: patient.id || `LP-${Date.now()}`,
        createdAt: patient.createdAt || new Date().toISOString(),
      };
      if (patients.some(p => p.id === record.id)) {
        const updated = patients.map(p => p.id === record.id ? { ...p, ...record } : p);
        this.savePatients(updated);
        return record;
      }
      const updated = [record, ...patients];
      this.savePatients(updated);
      return record;
    },

    updatePatient(id, patch) {
      const patients = this.loadPatients();
      const updated = patients.map(p => p.id === id ? { ...p, ...patch } : p);
      this.savePatients(updated);
    },

    deletePatient(id) {
      const patients = this.loadPatients();
      this.savePatients(patients.filter(p => p.id !== id));
    },

    pruneExpired(retentionDays) {
      if (!retentionDays) return;
      const patients = this.loadPatients();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - retentionDays);
      this.savePatients(patients.filter(p => {
        if (!p.createdAt) return true;
        return new Date(p.createdAt) >= cutoff;
      }));
    },
  };
}

/* ── Legacy singleton (do NOT use for new code) ──────── */
import storageService from './storageService';
const _legacy = createPatientService(storageService);
export default _legacy;
