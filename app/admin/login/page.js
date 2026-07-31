"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../services/auth';
import { Lock, User } from 'lucide-react';
import { useAdminFeedback } from '../../../components/admin/AdminFeedbackProvider';
import { validateLoginForm } from '../../../lib/adminValidation';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { notify } = useAdminFeedback();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateLoginForm({ username, password });
    if (validationErrors.length > 0) {
      const message = validationErrors.join(' ');
      setError(message);
      notify(message, { tone: 'error', title: 'Check your login details' });
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      notify('Signed in successfully.', { tone: 'success', title: 'Welcome back' });
      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(message);
      notify(message, { tone: 'error', title: 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-lg space-y-6">
        <div className="text-center">
          <span aria-hidden="true" className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface-2 font-display text-2xl font-bold text-primary mb-3">
            C
          </span>
          <h1 className="font-display text-2xl font-semibold">CMS Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">Sign in to manage website pages and leads</p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-500 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                aria-invalid={Boolean(error)}
                className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={Boolean(error)}
                className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
