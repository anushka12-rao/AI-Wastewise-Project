import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.status === 429) {
        setError('Too many login attempts. Please wait 15 minutes before trying again.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Authentication</h2>
          <p className="text-xs text-slate-500">
            Authorized administrators only. Single-owner session access to RAG knowledge base & query audit logs.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wastewise.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  disabled={loading}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  disabled={loading}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Credentials are seed-initialized via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">scripts/seedAdmin.js</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
