import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiMail, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';
import { useSuperAdmin } from '../context/SuperAdminContext';

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
      className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
    >
      <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
      <span>{message}</span>
    </motion.div>
  );
}

function FieldIcon({ icon: Icon }) {
  return <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useSuperAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!password) { setError('Password is required.'); return; }
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="m-auto flex w-full max-w-[420px] flex-col px-4 py-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 font-display text-2xl font-bold text-white shadow-lg shadow-amber-900/40">
            FC
          </span>
          <h1 className="font-display text-2xl font-bold text-white">Fast Coders</h1>
          <p className="mt-1 text-sm text-slate-400">Super Admin Panel</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl"
        >
          <h2 className="mb-5 text-lg font-bold text-white flex items-center gap-2">
            <FiShield className="text-amber-400" size={18} />
            Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>{error && <ErrorAlert message={error} />}</AnimatePresence>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Email address</span>
              <div className="relative">
                <FieldIcon icon={FiMail} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 pl-9 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-900/30"
                  placeholder="owner@yourcompany.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Password</span>
              <div className="relative">
                <FieldIcon icon={FiLock} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 pl-9 pr-10 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-900/30"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-300"
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition-all hover:from-amber-600 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Secure Login <FiArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Fast Coders Platform &middot; Authorized Access Only
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Fast Coders. All rights reserved.
        </p>
      </div>
    </div>
  );
}