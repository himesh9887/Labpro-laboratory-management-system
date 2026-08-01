import { 
  FiHome, FiUsers, FiCreditCard, FiDollarSign, FiActivity, 
  FiClock, FiSettings, FiBell, FiDatabase,
} from 'react-icons/fi';

export const adminNavigation = [
  { label: 'Dashboard',          to: '/admin',             icon: FiHome },
  { label: 'Laboratories',       to: '/admin/labs',        icon: FiUsers },
  { label: 'Subscriptions',      to: '/admin/subscriptions', icon: FiCreditCard },
  { label: 'Payments',           to: '/admin/payments',    icon: FiDollarSign },
  { label: 'Activity Logs',      to: '/admin/activity',    icon: FiActivity },
  { label: 'Login History',      to: '/admin/login-history', icon: FiClock },
  { label: 'Notifications',      to: '/admin/notifications', icon: FiBell },
  { label: 'Backup & Restore',   to: '/admin/backup',      icon: FiDatabase },
  { label: 'System Settings',    to: '/admin/settings',    icon: FiSettings },
];
