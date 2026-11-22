'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState<boolean>(true);
  const [envOverrideActive, setEnvOverrideActive] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth/status', { credentials: 'include', cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.authenticated) {
          router.replace('/admin');
          return;
        }
        setInitialized(Boolean(data.initialized));
        setEnvOverrideActive(Boolean(data.envOverrideActive));
      })
      .catch(() => {
        if (active) setError('Unable to check admin authentication status.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Please choose a strong admin password of at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not complete initial setup.');
        return;
      }
      router.replace('/admin');
    } catch {
      setError('Network error during admin setup.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError('Please enter the admin password.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Authentication failed.');
        return;
      }
      router.replace('/admin');
    } catch {
      setError('Network error while signing in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F3A] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-[#F2B705] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to ABM Global Ltd Website
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            ABM Global Ltd Admin Portal
          </h1>
          <p className="text-sm text-slate-300">
            {loading
              ? 'Verifying security state…'
              : initialized
              ? 'Enter the administrator password to manage enquiries, bookings, and website content.'
              : 'One-Time First-Run Setup: Create the administrator password to lock and protect this portal.'}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-7 shadow-2xl space-y-5">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#0B1F3A]" />
              <span className="text-sm">Checking security configuration…</span>
            </div>
          ) : !initialized ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="rounded-xl bg-[#F4F6F8] border border-slate-200 p-4 flex items-start gap-3 text-xs text-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#1E9E5A] shrink-0 mt-0.5" />
                <span>
                  This setup screen appears once only. As soon as you save your password, it is hashed with bcrypt and setup is permanently locked.
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 flex items-start gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="setup-password"
                  className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
                >
                  Create Admin Password (min 8 characters)
                </label>
                <input
                  id="setup-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="setup-confirm"
                  className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
                >
                  Confirm Admin Password
                </label>
                <input
                  id="setup-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] disabled:opacity-60 text-[#0B1F3A] text-sm font-medium transition-colors cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Securing Admin Account…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Create Password & Enter Dashboard
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {envOverrideActive && (
                <div className="rounded-lg bg-[#F4F6F8] border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
                  Managed passcode override is active via server environment settings.
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 flex items-start gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#0B1F3A] mb-1.5"
                >
                  Administrator Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#0B1F3A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] disabled:opacity-60 text-[#0B1F3A] text-sm font-medium transition-colors cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In to Admin Dashboard
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
