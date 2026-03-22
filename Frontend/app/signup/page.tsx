'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, ArrowRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import api from '@/app/lib/axios';

export default function SignupPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    First_Name: '',
    Last_Name: '',
    email: '',
    phone: '',
    Address: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // If already logged in, redirect away
  useEffect(() => {
    api
      .get('/auth/tokenData', { withCredentials: true })
      .then(() => router.replace('/cp/dashboard'))
      .catch(() => setCheckingAuth(false));
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.First_Name.trim()) e.First_Name = 'First name is required';
    if (!form.Last_Name.trim()) e.Last_Name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(
        '/auth/signup',
        {
          First_Name: form.First_Name,
          Last_Name: form.Last_Name,
          email: form.email,
          phone: form.phone,
          Address: form.Address,
          password: form.password,
        },
        { withCredentials: true }
      );

      toast.success(res.data?.message || 'Account created! Please sign in.');
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-10">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-linear-to-br from-blue-600 to-purple-600 px-8 py-10 text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UserPlus size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Create Account</h1>
            <p className="text-blue-100 text-center mt-2">Set up your admin account</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name"
                  name="First_Name"
                  value={form.First_Name}
                  onChange={handleChange}
                  placeholder="John"
                  icon={<User size={18} />}
                  error={errors.First_Name}
                />
                <Field
                  label="Last Name"
                  name="Last_Name"
                  value={form.Last_Name}
                  onChange={handleChange}
                  placeholder="Doe"
                  icon={<User size={18} />}
                  error={errors.Last_Name}
                />
              </div>

              {/* Email */}
              <Field
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                error={errors.email}
              />

              {/* Phone */}
              <Field
                label="Phone (optional)"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                icon={<Phone size={18} />}
              />

              {/* Address */}
              <Field
                label="Address (optional)"
                name="Address"
                value={form.Address}
                onChange={handleChange}
                placeholder="City, Country"
                icon={<MapPin size={18} />}
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.confirm ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable field component ──────────────────────────────────────────────────
function Field({
  label, name, type = 'text', value, onChange, placeholder, icon, error,
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon?: React.ReactNode; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-400' : 'border-gray-300'}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
