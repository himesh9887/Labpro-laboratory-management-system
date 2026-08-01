/**
 * defaultStaff.js
 * ───────────────
 * Default staff roster seeded into every newly created laboratory's
 * isolated storage (labpro_<LABID>_staff). Each lab gets its own copy
 * so records are never shared across tenants.
 */

export const DEFAULT_STAFF = [
  { id: 'STF-001', name: 'Dr. Kavita Menon',    role: 'Administrator',  email: 'kavita@labpro.in',  phone: '+91 98450 12345', department: 'Administration', active: true },
  { id: 'STF-002', name: 'Mr. Ravi Deshmukh',   role: 'Lab Technician', email: 'ravi@labpro.in',    phone: '+91 98765 43210', department: 'Hematology',      active: true },
  { id: 'STF-003', name: 'Ms. Priya Sharma',    role: 'Lab Technician', email: 'priya@labpro.in',   phone: '+91 99887 66554', department: 'Biochemistry',    active: true },
  { id: 'STF-004', name: 'Mr. Sunil Verma',     role: 'Pathologist',    email: 'sunil@labpro.in',   phone: '+91 98765 01122', department: 'Pathology',       active: true },
  { id: 'STF-005', name: 'Mrs. Anjali Gupta',   role: 'Receptionist',   email: 'anjali@labpro.in',  phone: '+91 97654 32100', department: 'Front Office',    active: true },
  { id: 'STF-006', name: 'Mr. Amit Patel',      role: 'Phlebotomist',   email: 'amit@labpro.in',    phone: '+91 96543 21009', department: 'Collection',      active: false },
];

