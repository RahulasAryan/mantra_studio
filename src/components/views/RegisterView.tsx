import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { LANDING_INFO } from '../../lib/constants';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
  onRegister: (name: string, email: string, pass: string) => Promise<{ ok: boolean; error?: string }>;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSwitchToLogin,
  onBack,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setBusy(true);
    const res = await onRegister(name.trim(), email.trim(), password);
    setBusy(false);
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-black px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08)_0%,_transparent_65%)]" />

      {/* Header bar */}
      <div className="relative z-20 mb-8 flex w-full max-w-md items-center justify-between">
        <span className="text-sm font-semibold tracking-[0.3em] text-white">
          {LANDING_INFO.name}
        </span>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </button>
      </div>

      <div className="liquid-glass relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-accent/20 text-2xl font-bold text-accent">
            {name ? name.charAt(0).toUpperCase() : 'M'}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Join {LANDING_INFO.name}
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Create your local profile to start using the operating system.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label block mb-1.5 text-white/70">Display Name / Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          </div>

          <div>
            <label className="label block mb-1.5 text-white/70">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
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
                placeholder="At least 6 characters"
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
            {busy ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Already have an account? <span className="text-accent underline font-medium">Sign in</span>
          </button>
        </div>
      </div>
    </main>
  );
};
