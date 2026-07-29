/**
 * patientService.js
 * ─────────────────
 * CRUD for patient records with retention-based pruning.
 * Key: labpro_patients
 */

import storageService from './storageService';

const KEY = 'patients';

const patientService = {
  loadPatients() {
    return storageService.get(KEY, []);
  },

  savePatients(arr) {
    storageService.set(KEY, arr);
  },

  addPatient(patient) {
    const patients = this.loadPatients();
    const record = {
      ...patient,
      id: patient.id || `LP-${Date.now()}`,
      createdAt: patient.createdAt || new Date().toISOString(),
    };
    // Avoid duplicates by id
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

  /**
   * Remove patients whose createdAt is older than retentionDays.
   * If retentionDays is null → never delete.
   */
  pruneExpired(retentionDays) {
    if (!retentionDays) return;
    const patients = this.loadPatients();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    this.savePatients(patients.filter(p => {
      if (!p.createdAt) return true; // keep if no timestamp
      return new Date(p.createdAt) >= cutoff;
    }));
  },
};

export default patientService;
