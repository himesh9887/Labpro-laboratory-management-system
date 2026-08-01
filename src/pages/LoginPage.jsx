import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiEyeOff, FiLock, FiMail, FiAlertCircle, FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/* ────────────────────────────────────────────────────────── */
/*  Shared UI helpers (keep existing project styles)          */
/* ────────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────── */
/*  Login Page Shell                                          */
/* ────────────────────────────────────────────────────────── */

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      <div className="m-auto flex w-full max-w-[480px] flex-col px-4 py-8">

        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 font-display text-2xl font-bold text-white shadow-lg shadow-blue-900/40">
            L
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">LabPro LIMS</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Laboratory Information Management System</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LabPro Diagnostics. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Login Form                                               */
/* ────────────────────────────────────────────────────────── */

function LoginForm() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!password)     { setError('Password is required.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="card p-7"
    >
      <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
        Welcome back
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>{error && <ErrorAlert message={error} />}</AnimatePresence>

        {/* Email */}
        <label className="block">
          <span className="label">Email address</span>
          <div className="relative">
            <FieldIcon icon={FiMail} />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="field pl-9"
              placeholder="admin@yourlab.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        {/* Password */}
        <label className="block">
          <span className="label">Password</span>
          <div className="relative">
            <FieldIcon icon={FiLock} />
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="field pl-9 pr-10"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </label>

        {/* Remember me */}
        <div className="flex items-center justify-start">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
          </label>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <FiArrowRight size={15} />
            </span>
          )}
        </button>
      </form>

    </motion.div>
  );
}

