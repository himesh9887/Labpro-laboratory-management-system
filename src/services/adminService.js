/**
 * adminService.js
 * ───────────────
 * Super Admin authentication and laboratory management service.
 *
 * Super Admin credentials:
 *   email:    admin@fastcoders.in
 *   password: stored as SHA-256 hash in global key 'labpro_admin_auth'
 *
 * All Super Admin data is stored in the global namespace (labpro_*)
 * and is completely separate from laboratory data.
 */

import storageService, { createScopedStorage } from './storageService';
import { hashPassword, verifyPassword } from './labService';
import { DEFAULT_STAFF } from '../data/defaultStaff';
import { buildDefaultTests } from '../data/testMaster';

/* ─── Constants ──────────────────────────────────────────── */

const ADMIN_KEY = 'admin_auth';      // labpro_admin_auth
const LABS_KEY  = 'registry';        // labpro_registry (shared with labService)
const PAYMENTS_KEY = 'payment_history'; // labpro_payment_history
const LOGIN_HISTORY_KEY = 'login_history'; // labpro_login_history
const ACTIVITY_LOG_KEY = 'admin_activity_log';  // labpro_admin_activity_log
const NOTIFICATIONS_KEY = 'notifications'; // labpro_notifications
const BACKUP_KEY = 'backup_metadata'; // labpro_backup_metadata

/* ─── Plan Definitions ───────────────────────────────────── */

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 999,
    storage: 500,     // MB
    users: 5,
    reports: 100,
    invoices: 200,
    support: 'Email',
    features: ['Basic Dashboard', 'Invoice Management', 'Test Master', 'Staff Management'],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 2499,
    storage: 2000,
    users: 15,
    reports: 500,
    invoices: 1000,
    support: 'Email & Phone',
    features: ['All Basic Features', 'Advanced Reports', 'Patient Portal', 'Multi-User'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 4999,
    storage: 5000,
    users: 50,
    reports: 2000,
    invoices: 5000,
    support: 'Priority 24/7',
    features: ['All Standard Features', 'API Access', 'Custom Branding', 'Advanced Analytics'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    storage: 20000,
    users: 999,
    reports: 99999,
    invoices: 99999,
    support: 'Dedicated Manager',
    features: ['All Premium Features', 'White Label', 'SSO', 'SLA Guarantee', 'Custom Integrations'],
  },
};

export const LAB_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  EXPIRED: 'Expired',
  DELETED: 'Deleted',
};

const STATUS_ICON = {
  lab_created: '🏥',
  lab_deleted: '🗑️',
  lab_updated: '✏️',
  lab_suspended: '⛔',
  lab_activated: '✅',
  payment_received: '💰',
  notification_broadcast: '📢',
  backup_created: '💾',
  backup_restored: '♻️',
  password_reset: '🔑',
  plan_changed: '📊',
};

const STATUS_TITLE = {
  lab_created: 'Laboratory Created',
  lab_deleted: 'Laboratory Deleted',
  lab_updated: 'Laboratory Updated',
  lab_suspended: 'Laboratory Suspended',
  lab_activated: 'Laboratory Activated',
  payment_received: 'Payment Received',
  notification_broadcast: 'Notification Broadcast',
  backup_created: 'Backup Created',
  backup_restored: 'Backup Restored',
  password_reset: 'Password Reset',
  plan_changed: 'Plan Changed',
};

/* ─── Admin Auth ──────────────────────────────────────────── */

const adminService = {
  /**
   * Initialize the single super admin account on first run.
   * No default email/password are shipped in source code.
   */
  async initializeAdmin({ email, password }) {
    const existing = storageService.get(ADMIN_KEY, null);
    if (existing) {
      throw new Error('The super admin account has already been configured.');
    }

    if (!email?.trim() || !password?.trim()) {
      throw new Error('An email address and password are required to create the super admin account.');
    }

    const passwordHash = await hashPassword(password);
    storageService.set(ADMIN_KEY, {
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    });
    return true;
  },

  /**
   * Check whether the super admin account has been configured.
   */
  hasAdminAccount() {
    return !!storageService.get(ADMIN_KEY, null);
  },

  /**
   * Verify super admin login credentials.
   */
  async verifyAdminLogin(email, password) {
    const admin = storageService.get(ADMIN_KEY, null);
    if (!admin) return null;

    if (email.trim().toLowerCase() !== admin.email.toLowerCase()) return null;

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) return null;

    return { email: admin.email, role: admin.role };
  },

  /**
   * Change super admin password.
   */
  async changePassword(oldPassword, newPassword) {
    const admin = storageService.get(ADMIN_KEY, null);
    if (!admin) return false;

    const ok = await verifyPassword(oldPassword, admin.passwordHash);
    if (!ok) return false;

    const newHash = await hashPassword(newPassword);
    storageService.set(ADMIN_KEY, { ...admin, passwordHash: newHash });
    return true;
  },

  /* ─── Lab Management ────────────────────────────────────── */

  /**
   * Create a new laboratory (Super Admin only).
   */
  async createLab(formData) {
    const registry = this.getAllLabs();

    // Duplicate email check
    const existing = registry.find(
      lab => lab.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (existing) {
      throw new Error('A laboratory with this email already exists.');
    }

    // Generate Lab ID
    const max = registry.reduce((m, lab) => {
      const num = parseInt((lab.labId || '').replace(/\D/g, '')) || 0;
      return num > m ? num : m;
    }, 0);
    const labId = `LAB${String(max + 1).padStart(3, '0')}`;

    const passwordHash = await hashPassword(formData.password);

    const newLab = {
      labId,
      labName:      formData.labName.trim(),
      ownerName:    formData.ownerName.trim(),
      adminName:    formData.adminName.trim(),
      mobile:       formData.mobile.trim(),
      email:        formData.email.trim().toLowerCase(),
      passwordHash,
      address:      formData.address.trim(),
      city:         formData.city.trim(),
      state:        formData.state.trim(),
      pincode:      formData.pincode.trim(),
      gstNumber:    formData.gstNumber?.trim() || '',
      logo:         formData.logo || null,
      status:       LAB_STATUS.ACTIVE,
      plan:         formData.plan || 'basic',
      planStartDate: new Date().toISOString(),
      planExpiryDate: formData.expiryDate
        ? new Date(formData.expiryDate).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
      createdBy:    'super_admin',
    };

    this._saveRegistry([...registry, newLab]);

    // Initialize scoped storage for the new lab
    const scoped = createScopedStorage(labId);
    scoped.set('lab_meta', {
      labId: newLab.labId,
      labName: newLab.labName,
      createdAt: newLab.createdAt,
      status: newLab.status,
      plan: newLab.plan,
    });

    // Seed isolated lab storage with default data
    scoped.set('staff', DEFAULT_STAFF);
    scoped.set('tests', buildDefaultTests());
    scoped.set('settings', {
      autoClear: true,
      keepHistory: true,
      retentionDays: 7,
      labProfile: {
        name:    newLab.labName,
        license: formData.gstNumber?.trim() || '',
        email:   newLab.email,
        phone:   newLab.mobile,
        address: `${newLab.address}, ${newLab.city}, ${newLab.state} - ${newLab.pincode}`,
        website: '',
        logo:    newLab.logo || null,
      },
    });

    // Log activity
    this.logActivity('lab_created', `Laboratory ${labId} (${formData.labName}) created`);

    const safeLab = { ...newLab };
    delete safeLab.passwordHash;
    return safeLab;
  },

  /**
   * Update laboratory details.
   */
  updateLab(labId, updates) {
    const registry = this.getAllLabs();
    const updated = registry.map(lab => {
      if (lab.labId !== labId) return lab;
      // Never overwrite passwordHash accidentally
      const safe = { ...updates };
      delete safe.passwordHash;
      return { ...lab, ...safe, updatedAt: new Date().toISOString() };
    });
    this._saveRegistry(updated);
    return updated.find(l => l.labId === labId);
  },

  /**
   * Delete a laboratory (marks as deleted, doesn't remove data for safety).
   */
  deleteLab(labId) {
    this.updateLab(labId, { status: LAB_STATUS.DELETED });
    this.logActivity('lab_deleted', `Laboratory ${labId} marked as deleted`);
    return true;
  },

  /**
   * Permanently remove a lab and ALL its data.
   * WARNING: This is irreversible.
   */
  permanentlyDeleteLab(labId) {
    const registry = this.getAllLabs();
    const filtered = registry.filter(lab => lab.labId !== labId);
    this._saveRegistry(filtered);

    // Remove scoped storage
    const scoped = createScopedStorage(labId);
    scoped.clearAll();

    this.logActivity('lab_deleted', `Laboratory ${labId} permanently deleted`);
    return true;
  },

  /**
   * Suspend a laboratory.
   */
  suspendLab(labId) {
    this.updateLab(labId, { status: LAB_STATUS.SUSPENDED });
    this.logActivity('lab_suspended', `Laboratory ${labId} suspended`);
    return true;
  },

  /**
   * Activate a laboratory.
   */
  activateLab(labId) {
    this.updateLab(labId, { status: LAB_STATUS.ACTIVE });
    this.logActivity('lab_activated', `Laboratory ${labId} activated`);
    return true;
  },

  /**
   * Reset laboratory password.
   */
  async resetLabPassword(labId, newPassword) {
    const passwordHash = await hashPassword(newPassword);
    this.updateLab(labId, { passwordHash });
    this.logActivity('password_reset', `Password reset for laboratory ${labId}`);
    return true;
  },

  /**
   * Reset laboratory login data (clear their session, keep data).
   */
  resetLabLogin(labId) {
    const scoped = createScopedStorage(labId);
    scoped.remove('session_data');
    return true;
  },

  /**
   * Get laboratory by ID (without password hash).
   */
  getLab(labId) {
    const lab = this.findById(labId);
    if (!lab) return null;
    const safeLab = { ...lab };
    delete safeLab.passwordHash;
    return safeLab;
  },

  /* ─── Registry Methods ──────────────────────────────────── */

  getAllLabs() {
    return storageService.get(LABS_KEY, []);
  },

  _saveRegistry(arr) {
    storageService.set(LABS_KEY, arr);
  },

  findById(labId) {
    const registry = this.getAllLabs();
    return registry.find(lab => lab.labId === labId) || null;
  },

  findByEmail(email) {
    const registry = this.getAllLabs();
    return registry.find(lab => lab.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Get labs filtered by status.
   */
  getLabsByStatus(status) {
    return this.getAllLabs().filter(lab => lab.status === status);
  },

  /**
   * Get active labs.
   */
  getActiveLabs() {
    return this.getLabsByStatus(LAB_STATUS.ACTIVE);
  },

  /**
   * Search labs by name, email, labId.
   */
  searchLabs(query) {
    const q = query.toLowerCase();
    return this.getAllLabs().filter(lab =>
      lab.labId.toLowerCase().includes(q) ||
      lab.labName.toLowerCase().includes(q) ||
      lab.email.toLowerCase().includes(q) ||
      lab.ownerName?.toLowerCase().includes(q) ||
      lab.adminName?.toLowerCase().includes(q)
    );
  },

  /* ─── Subscription & Plans ──────────────────────────────── */

  getPlans() {
    return Object.values(PLANS);
  },

  getPlan(planId) {
    return PLANS[planId] || PLANS.basic;
  },

  updateLabPlan(labId, planId, expiryDate) {
    const plan = this.getPlan(planId);
    if (!plan) throw new Error('Invalid plan');

    this.updateLab(labId, {
      plan: planId,
      planStartDate: new Date().toISOString(),
      planExpiryDate: expiryDate
        ? new Date(expiryDate).toISOString()
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
    this.logActivity('plan_changed', `Plan for ${labId} changed to ${plan.name}`);
    return true;
  },

  getRemainingDays(lab) {
    if (!lab?.planExpiryDate) return 0;
    const diff = new Date(lab.planExpiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  /* ─── Payments ──────────────────────────────────────────── */

  recordPayment(labId, amount, mode, notes = '') {
    const payments = storageService.get(PAYMENTS_KEY, []);
    const lab = this.findById(labId);
    const payment = {
      id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      labId,
      labName: lab?.labName || labId,
      amount,
      mode: mode || 'Bank Transfer',
      status: 'Paid',
      notes,
      date: new Date().toISOString(),
    };
    storageService.set(PAYMENTS_KEY, [payment, ...payments]);
    this.logActivity('payment_received', `Payment of ₹${amount} received from ${labId}`);
    return payment;
  },

  getPayments(labId = null) {
    const payments = storageService.get(PAYMENTS_KEY, []);
    const enriched = payments.map(p => {
      const lab = this.findById(p.labId);
      return { ...p, labName: p.labName || lab?.labName || p.labId };
    });
    if (labId) return enriched.filter(p => p.labId === labId);
    return enriched;
  },

  getAllPayments() {
    return this.getPayments();
  },

  getPaymentStats() {
    const payments = storageService.get(PAYMENTS_KEY, []);
    const totalPaid = payments.reduce((s, p) => s + (p.status === 'Paid' ? p.amount : 0), 0);
    const totalPending = payments.reduce((s, p) => s + (p.status === 'Pending' ? p.amount : 0), 0);
    return { totalPaid, totalPending, count: payments.length };
  },

  /* ─── Login History ─────────────────────────────────────── */

  recordLogin(labId, browser, device, ip) {
    const history = storageService.get(LOGIN_HISTORY_KEY, []);
    const lab = this.findById(labId);
    const record = {
      id: `LOGIN-${Date.now()}`,
      labId,
      labName: lab?.labName || labId,
      loginTime: new Date().toISOString(),
      browser: browser || navigator?.userAgent || 'Unknown',
      device: device || 'Unknown',
      ip: ip || '127.0.0.1',
      logoutTime: null,
    };
    storageService.set(LOGIN_HISTORY_KEY, [record, ...history]);
    return record;
  },

  recordLogout(labId) {
    const history = storageService.get(LOGIN_HISTORY_KEY, []);
    const updated = history.map(record => {
      if (record.labId === labId && !record.logoutTime) {
        return { ...record, logoutTime: new Date().toISOString() };
      }
      return record;
    });
    storageService.set(LOGIN_HISTORY_KEY, updated);
  },

  getLoginHistory(labId = null) {
    const history = storageService.get(LOGIN_HISTORY_KEY, []);
    const enriched = history.map(h => {
      const lab = this.findById(h.labId);
      return { ...h, labName: h.labName || lab?.labName || h.labId };
    });
    if (labId) return enriched.filter(h => h.labId === labId);
    return enriched;
  },

  getAllLoginHistory() {
    return this.getLoginHistory();
  },

  /* ─── Activity Log ──────────────────────────────────────── */

  logActivity(type, detail = '') {
    const log = storageService.get(ACTIVITY_LOG_KEY, []);
    const entry = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      icon: STATUS_ICON[type] || '📌',
      title: STATUS_TITLE[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      detail,
      timestamp: new Date().toISOString(),
    };
    storageService.set(ACTIVITY_LOG_KEY, [entry, ...log].slice(0, 500));
    return entry;
  },

  getActivityLog(limit = 100) {
    const log = storageService.get(ACTIVITY_LOG_KEY, []);
    return log.slice(0, limit);
  },

  getAllActivityLogs(limit = 100) {
    return this.getActivityLog(limit);
  },

  /* ─── Notifications ─────────────────────────────────────── */

  sendNotification(labId, title, message, type = 'info') {
    const notifications = storageService.get(NOTIFICATIONS_KEY, []);
    const notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      labId: labId || 'all',
      labName: labId ? (this.findById(labId)?.labName || labId) : 'All Laboratories',
      title,
      message,
      type, // 'info' | 'warning' | 'maintenance' | 'update' | 'subscription' | 'payment'
      read: false,
      createdAt: new Date().toISOString(),
    };
    storageService.set(NOTIFICATIONS_KEY, [notification, ...notifications]);
    return notification;
  },

  broadcastNotification(title, message, type, labIds = null) {
    if (labIds && Array.isArray(labIds)) {
      labIds.forEach(labId => this.sendNotification(labId, title, message, type));
    } else {
      this.sendNotification('all', title, message, type);
    }
    this.logActivity('notification_broadcast', `${title} - ${type}`);
    return true;
  },

  getNotifications(labId = null) {
    const notifications = storageService.get(NOTIFICATIONS_KEY, []);
    if (labId) {
      return notifications.filter(n => n.labId === labId || n.labId === 'all');
    }
    return notifications;
  },

  markNotificationRead(notifId) {
    const notifications = storageService.get(NOTIFICATIONS_KEY, []);
    const updated = notifications.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    storageService.set(NOTIFICATIONS_KEY, updated);
  },

  markAllNotificationsRead() {
    const notifications = storageService.get(NOTIFICATIONS_KEY, []);
    const updated = notifications.map(n => ({ ...n, read: true }));
    storageService.set(NOTIFICATIONS_KEY, updated);
  },

  deleteNotification(notifId) {
    const notifications = storageService.get(NOTIFICATIONS_KEY, []);
    storageService.set(NOTIFICATIONS_KEY, notifications.filter(n => n.id !== notifId));
  },

  /* ─── Backup & Restore ──────────────────────────────────── */

  createBackup(labId = null) {
    const backup = {};

    if (labId) {
      // Backup single lab
      const scoped = createScopedStorage(labId);
      backup[labId] = scoped.exportAll();
    } else {
      // Backup all labs
      const labs = this.getAllLabs();
      labs.forEach(lab => {
        if (lab.status === LAB_STATUS.DELETED) return;
        const scoped = createScopedStorage(lab.labId);
        backup[lab.labId] = scoped.exportAll();
      });
      // Also backup admin data
      backup.__admin__ = {
        registry: storageService.get('registry'),
        payments: storageService.get('payment_history'),
        loginHistory: storageService.get('login_history'),
        adminAuth: storageService.get('admin_auth'),
      };
    }

    const meta = {
      id: `BACKUP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      labCount: Object.keys(backup).filter(k => k !== '__admin__').length,
      labId: labId || 'all',
    };

    const backups = storageService.get(BACKUP_KEY, []);
    storageService.set(BACKUP_KEY, [meta, ...backups].slice(0, 20));

    this.logActivity('backup_created', `Backup ${meta.id} created (${meta.labCount} labs)`);

    return { meta, data: backup };
  },

  restoreBackup(backupData) {
    if (!backupData?.data) throw new Error('Invalid backup data');

    Object.entries(backupData.data).forEach(([key, data]) => {
      if (key === '__admin__') {
        // Restore admin data
        if (data.registry) storageService.set('registry', data.registry);
        if (data.payments) storageService.set('payment_history', data.payments);
        if (data.loginHistory) storageService.set('login_history', data.loginHistory);
        if (data.adminAuth) storageService.set('admin_auth', data.adminAuth);
      } else {
        // Restore lab data
        const scoped = createScopedStorage(key);
        scoped.importAll(data);
      }
    });

    this.logActivity('backup_restored', `Backup restored with ${Object.keys(backupData.data).filter(k => k !== '__admin__').length} labs`);
    return true;
  },

  getBackups() {
    return storageService.get(BACKUP_KEY, []);
  },

  /* ─── Analytics ─────────────────────────────────────────── */

  getSystemStats() {
    const labs = this.getAllLabs();
    const activeLabs = labs.filter(l => l.status === LAB_STATUS.ACTIVE);
    const inactiveLabs = labs.filter(l => l.status === LAB_STATUS.INACTIVE);
    const suspendedLabs = labs.filter(l => l.status === LAB_STATUS.SUSPENDED);
    const expiredLabs = labs.filter(l => l.status === LAB_STATUS.EXPIRED);

    // Aggregate data across all labs
    let totalRevenue = 0;
    let totalInvoices = 0;
    let totalReports = 0;
    let totalTests = 0;
    let totalStaff = 0;
    let totalPatients = 0;
    let todayRevenue = 0;

    activeLabs.forEach(lab => {
      const scoped = createScopedStorage(lab.labId);
      const invoices = scoped.get('invoices', []);
      const reports = scoped.get('reports', []);
      const staff = scoped.get('staff', []);
      const patients = scoped.get('patients', []);
      const history = scoped.get('history', {});

      const todayStr = new Date().toISOString().slice(0, 10);
      const allInvoices = [
        ...invoices,
        ...Object.values(history || {}).flat(),
      ];

      allInvoices.forEach(inv => {
        totalRevenue += inv.paidAmount || 0;
        totalInvoices++;
        totalTests += inv.selectedTests?.length || 0;
        if (inv.createdAt?.slice(0, 10) === todayStr) {
          todayRevenue += inv.paidAmount || 0;
        }
      });

      reports.forEach(() => {
        totalReports++;
      });

      totalStaff += Array.isArray(staff) ? staff.filter(s => s.active !== false).length : 0;
      totalPatients += Array.isArray(patients) ? patients.length : 0;
    });

    // Plan breakdown
    const planBreakdown = ['basic', 'standard', 'premium', 'enterprise'].map(pid => ({
      plan: PLANS[pid].name,
      count: labs.filter(l => l.plan === pid).length,
    }));

    const storageUsed = this.estimateStorageUsage();

    return {
      totalLabs: labs.length,
      activeLabs: activeLabs.length,
      inactiveLabs: inactiveLabs.length,
      suspendedLabs: suspendedLabs.length,
      expiredLabs: expiredLabs.length,
      totalRevenue,
      todayRevenue,
      totalInvoices,
      totalReports,
      totalTests,
      totalStaff,
      totalPatients,
      totalPayments: this.getPaymentStats().count,
      totalSubscriptions: labs.filter(l => l.status !== LAB_STATUS.DELETED).length,
      activeSubscriptions: activeLabs.length,
      totalRecords: totalInvoices + totalReports + totalStaff + totalPatients,
      planBreakdown,
      storageUsed: this.formatBytes(storageUsed),
      storageBytes: storageUsed,
      systemStatus: activeLabs.length > 0 ? 'Operational' : 'No Active Labs',
      payments: this.getPaymentStats(),
    };
  },

  getSystemAnalytics() {
    return this.getSystemStats();
  },

  estimateStorageUsage() {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('labpro_')) {
          const val = localStorage.getItem(key);
          total += (key.length + (val?.length || 0)) * 2; // UTF-16
        }
      }
    } catch { /* ignore */ }
    return total;
  },

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default adminService;

