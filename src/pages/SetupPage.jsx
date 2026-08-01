import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield } from 'react-icons/fi';
import adminService from '../services/adminService';
import { useSuperAdmin } from '../context/SuperAdminContext';

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 8 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    >
      <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
      <span>{message}</span>
    </motion.div>
  );
}

function FieldIcon({ icon: Icon }) {
  return <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />;
}

export default function SetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, adminConfigured } = useSuperAdmin();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await adminService.initializeAdmin({ email: email.trim(), password });
      await adminLogin(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Initial setup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="m-auto flex w-full max-w-[420px] flex-col px-4 py-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 font-display text-2xl font-bold text-white shadow-lg shadow-blue-900/40">
            L
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Initial Owner Setup</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create the single Super Admin account for this SaaS instance.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card p-7"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <FiShield className="text-blue-600 dark:text-blue-400" size={16} />
            Owner-controlled bootstrap
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>{error && <ErrorAlert message={error} />}</AnimatePresence>

            <label className="block">
              <span className="label">Super Admin Email</span>
              <div className="relative">
                <FieldIcon icon={FiMail} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field pl-9"
                  placeholder="owner@yourcompany.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="label">Password</span>
              <div className="relative">
                <FieldIcon icon={FiLock} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pl-9 pr-10"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="label">Confirm Password</span>
              <div className="relative">
                <FieldIcon icon={FiLock} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field pl-9 pr-10"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || adminConfigured}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Creating owner account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Owner Account <FiArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
