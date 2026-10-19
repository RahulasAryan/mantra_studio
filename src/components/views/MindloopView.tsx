import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Minimize2, Play, CheckCircle2, Sparkles } from 'lucide-react';

interface MindloopViewProps {
  onBack: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

const STEPS = [
  {
    icon: Target,
    step: '01 · Spot',
    title: 'Name what is stuck',
    text: 'One sentence. "I keep avoiding my SQL revision." Saying it out loud is the whole trick — thinking it is not enough.',
  },
  {
    icon: Minimize2,
    step: '02 · Shrink',
    title: 'Find the smallest next step',
    text: 'Not "finish the project" — "write the first bullet point". Small enough that starting feels free.',
  },
  {
    icon: Play,
    step: '03 · Go',
    title: 'Do it today',
    text: 'MANTRA adds it to your tasks and can nudge you at the time you choose. Tomorrow you pick up right where today is: one loop further.',
  },
];

const REASONS = [
  'Works when you are overwhelmed, not just organised',
  'Two minutes a day — one loop, tracked, done',
  'Lives inside your MANTRA tasks and daily reminder',
];

export const MindloopView: React.FC<MindloopViewProps> = ({
  onBack,
  onLogin,
  onGetStarted,
}) => {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-black text-white">
      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            <ArrowLeft size={16} />
            MANTRA
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLogin}
              className="text-xs text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center px-6 py-16 text-center md:py-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.35em] text-white/40"
        >
          A MANTRA concept
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif mt-8 text-6xl tracking-tight text-white sm:text-7xl md:text-8xl italic"
        >
          One loop a day.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/70"
        >
          The two-minute mental checkpoint that turns the thing you are avoiding into a next step you can actually take — and lets MANTRA keep the loop turning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={onGetStarted}
            className="liquid-glass rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            Start the loop
          </button>
          <span className="inline-flex items-center gap-2 text-xs text-white/50">
            <Sparkles size={14} className="text-accent" /> free to try inside MANTRA
          </span>
        </motion.div>
      </header>

      {/* Steps */}
      <section className="relative mx-auto grid max-w-5xl gap-6 px-6 py-12 md:grid-cols-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="liquid-glass rounded-2xl p-7"
            >
              <div className="inline-grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white">
                <Icon size={20} />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.25em] text-white/40">
                {step.step}
              </p>
              <h2 className="mt-2 text-xl font-medium tracking-tight text-white">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {step.text}
              </p>
            </motion.div>
          );
        })}
      </section>

      {/* Why it works */}
      <section className="px-6 py-16">
        <div className="liquid-glass mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-2xl p-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Why it works
            </p>
            <ul className="mt-4 space-y-3">
              {REASONS.map((reason) => (
                <li key={reason} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 size={16} className="text-accent shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-white px-7 py-3 text-xs font-semibold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Create your account
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="liquid-glass rounded-full px-7 py-3 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            >
              I already have one
            </button>
          </div>
        </div>
      </section>

      <footer className="px-6 pb-12 text-center">
        <p className="text-xs text-white/35">
          Concept page · Mindloop is built directly into MANTRA daily task tracking.
        </p>
      </footer>
    </div>
  );
};
