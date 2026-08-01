import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiPhone, FiMapPin,
  FiHome, FiUpload, FiCheck, FiAlertCircle, FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

/* ────────────────────────────────────────────────────────── */
/*  Shared UI helpers                                          */
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

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli','Daman & Diu','Delhi',
  'Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const INITIAL_FORM = {
  labName: '', ownerName: '', adminName: '', mobile: '',
  email: '', password: '', confirmPassword: '',
  address: '', city: '', state: '', pincode: '',
  logo: null, acceptTerms: false,
};

/* ────────────────────────────────────────────────────────── */
/*  Register Page                                              */
/* ────────────────────────────────────────────────────────── */

export default function RegisterPage() {
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [logoName, setLogoName] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = useCallback((field, value) =>
    setForm(prev => ({ ...prev, [field]: value })), []);

  /* Logo upload */
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be under 2 MB.'); return; }
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => set('logo', ev.target.result);
    reader.readAsDataURL(file);
  };

  /* Validation */
  const validate = () => {
    if (!form.labName.trim())   return 'Laboratory name is required.';
    if (!form.ownerName.trim()) return 'Owner name is required.';
    if (!form.adminName.trim()) return 'Administrator name is required.';
    if (!form.mobile.trim())    return 'Mobile number is required.';
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, ''))) return 'Enter a valid 10-digit mobile number.';
    if (!form.email.trim())     return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password)         return 'Password is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.address.trim())   return 'Laboratory address is required.';
    if (!form.city.trim())      return 'City is required.';
    if (!form.state)            return 'State is required.';
    if (!form.pincode.trim())   return 'Pincode is required.';
    if (!/^\d{6}$/.test(form.pincode.replace(/\D/g, ''))) return 'Enter a valid 6-digit pincode.';
    if (!form.acceptTerms)      return 'You must accept the Terms of Service to continue.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Check for duplicate email — show friendly message
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setError('This laboratory is already registered. Please login.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      <div className="m-auto flex w-full max-w-[600px] flex-col px-4 py-8">

        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 font-display text-2xl font-bold text-white shadow-lg shadow-blue-900/40">
            L
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Register Laboratory</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            One-time registration to set up your laboratory on LabPro LIMS
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card p-7"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>{error && <ErrorAlert message={error} />}</AnimatePresence>

            {/* ── Section: Lab Identity ── */}
            <fieldset>
              <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <FiHome size={13} /> Laboratory Details
              </legend>
              <div className="space-y-3">
                <label className="block">
                  <span className="label">Laboratory Name <span className="text-rose-500">*</span></span>
                  <div className="relative">
                    <FieldIcon icon={FiActivity} />
                    <input
                      id="reg-labName"
                      className="field pl-9"
                      value={form.labName}
                      onChange={e => set('labName', e.target.value)}
                      placeholder="e.g. Apollo Diagnostics"
                      required
                    />
                  </div>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">Owner Name <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <FieldIcon icon={FiUser} />
                      <input
                        id="reg-ownerName"
                        className="field pl-9"
                        value={form.ownerName}
                        onChange={e => set('ownerName', e.target.value)}
                        placeholder="Dr. Full Name"
                        required
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="label">Administrator Name <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <FieldIcon icon={FiUser} />
                      <input
                        id="reg-adminName"
                        className="field pl-9"
                        value={form.adminName}
                        onChange={e => set('adminName', e.target.value)}
                        placeholder="Admin Full Name"
                        required
                      />
                    </div>
                  </label>
                </div>
                <label className="block">
                  <span className="label">Mobile Number <span className="text-rose-500">*</span></span>
                  <div className="relative">
                    <FieldIcon icon={FiPhone} />
                    <input
                      id="reg-mobile"
                      className="field pl-9"
                      value={form.mobile}
                      onChange={e => set('mobile', e.target.value)}
                      placeholder="+91 98765 43210"
                      type="tel"
                      required
                    />
                  </div>
                </label>
              </div>
            </fieldset>

            {/* ── Section: Login Credentials ── */}
            <fieldset>
              <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <FiLock size={13} /> Login Credentials
              </legend>
              <div className="space-y-3">
                <label className="block">
                  <span className="label">Email Address <span className="text-rose-500">*</span></span>
                  <div className="relative">
                    <FieldIcon icon={FiMail} />
                    <input
                      id="reg-email"
                      type="email"
                      className="field pl-9"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="admin@yourlab.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">Password <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <FieldIcon icon={FiLock} />
                      <input
                        id="reg-password"
                        type={showPwd ? 'text' : 'password'}
                        className="field pl-9 pr-10"
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                        {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                  </label>
                  <label className="block">
                    <span className="label">Confirm Password <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <FieldIcon icon={FiLock} />
                      <input
                        id="reg-confirmPassword"
                        type={showCpw ? 'text' : 'password'}
                        className="field pl-9 pr-10"
                        value={form.confirmPassword}
                        onChange={e => set('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" onClick={() => setShowCpw(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                        {showCpw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                  </label>
                </div>
                {/* Password strength indicator */}
                {form.password && <PasswordStrength password={form.password} />}
              </div>
            </fieldset>

            {/* ── Section: Address ── */}
            <fieldset>
              <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <FiMapPin size={13} /> Laboratory Address
              </legend>
              <div className="space-y-3">
                <label className="block">
                  <span className="label">Street Address <span className="text-rose-500">*</span></span>
                  <div className="relative">
                    <FieldIcon icon={FiMapPin} />
                    <input
                      id="reg-address"
                      className="field pl-9"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="Door No., Street, Area"
                      required
                    />
                  </div>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="label">City <span className="text-rose-500">*</span></span>
                    <input
                      id="reg-city"
                      className="field"
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="label">State <span className="text-rose-500">*</span></span>
                    <select
                      id="reg-state"
                      className="field"
                      value={form.state}
                      onChange={e => set('state', e.target.value)}
                      required
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label">Pincode <span className="text-rose-500">*</span></span>
                    <input
                      id="reg-pincode"
                      className="field"
                      value={form.pincode}
                      onChange={e => set('pincode', e.target.value)}
                      placeholder="6 digits"
                      maxLength={6}
                      required
                    />
                  </label>
                </div>
              </div>
            </fieldset>

            {/* ── Logo upload (optional) ── */}
            <fieldset>
              <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <FiUpload size={13} /> Laboratory Logo <span className="font-normal normal-case text-slate-400">(Optional)</span>
              </legend>
              <label
                htmlFor="reg-logo"
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-blue-500"
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-200 dark:bg-slate-700">
                    <FiUpload className="text-slate-400" size={20} />
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {logoName || 'Click to upload logo'}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG or SVG · Max 2 MB</p>
                </div>
              </label>
              <input id="reg-logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </fieldset>

            {/* ── Accept Terms ── */}
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id="reg-terms"
                type="checkbox"
                checked={form.acceptTerms}
                onChange={e => set('acceptTerms', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                I agree to the{' '}
                <button type="button" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                  Privacy Policy
                </button>
                . I confirm this laboratory has not been registered before.
              </span>
            </label>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Creating Laboratory...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiCheck size={16} /> Register Laboratory
                </span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
            Already registered?{' '}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign in here
            </a>
          </p>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} LabPro Diagnostics. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Password Strength Indicator                              */
/* ────────────────────────────────────────────────────────── */

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-rose-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              n <= score ? colors[score] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
        {score > 0 && (
          <span className={`ml-1 text-[10px] font-semibold ${colors[score].replace('bg-', 'text-')}`}>
            {labels[score]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-1 text-[10px] ${
            c.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.pass ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

