import { FiActivity, FiFilePlus, FiFileText, FiHome, FiSettings, FiUsers, FiUserPlus, FiDollarSign } from 'react-icons/fi';
export const navigation = [
  { label: 'Dashboard', to: '/dashboard', icon: FiHome },
  { label: 'Create Report', to: '/reports/create', icon: FiFilePlus },
  { label: 'Reports', to: '/reports', icon: FiFileText },
  { label: 'Tests', to: '/tests', icon: FiActivity },
  { label: 'Invoice', to: '/invoice', icon: FiDollarSign },
  { label: 'Staff', to: '/staff', icon: FiUserPlus },
  { label: 'Settings', to: '/settings', icon: FiSettings },
];
