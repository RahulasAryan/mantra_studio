import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, UserCheck } from 'lucide-react';
import { FluidCanvas } from '../FluidCanvas';
import { LANDING_INFO } from '../../lib/constants';

interface LoginViewProps {
  onSwitchToRegister: () => void;
  onBack: () => void;
  onLogin: (email: string, pass: string) => Promise<{ ok: boolean; error?: string }>;
  onGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSwitchToRegister,
  onBack,
  onLogin,
  onGuest,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setBusy(true);
    const res = await onLogin(email.trim(), password);
    setBusy(false);
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-black text-white">
      {/* Background Fluid Canvas */}
      <div className="absolute inset-0 opacity-40">
        <FluidCanvas color="#3b82f6" />
      </div>

      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5 text-base font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-xs text-accent">
            {LANDING_INFO.mark}
          </span>
          {LANDING_INFO.name}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </button>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="liquid-glass w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Sign in to MANTRA
            </h1>
            <p className="mt-2 text-xs text-white/60">
              Access your personal tasks, commands, and preferences.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1.5 text-white/70">Email or Username</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label block mb-1.5 text-white/70">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-xl bg-white py-3 text-xs font-semibold text-black hover:opacity-90 active:scale-98 transition-all disabled:opacity-50"
            >
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={onGuest}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
            >
              <UserCheck size={14} /> Continue as Guest
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Don't have an account? <span className="text-accent underline font-medium">Create one</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
