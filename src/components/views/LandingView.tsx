import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Cpu, Mic } from 'lucide-react';
import { LANDING_INFO, LANDING_MEDIA } from '../../lib/constants';

interface LandingViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onMindloop: () => void;
}

const COMPARISON_ITEMS = [
  {
    name: 'Siri',
    text: 'One command, one app, then it stops listening. Multi-step asks fall apart halfway through.',
    icon: Mic,
  },
  {
    name: 'Google Assistant',
    text: 'Great at answers and reminders — less good at the five taps that come after them.',
    icon: Cpu,
  },
  {
    name: 'Bixby',
    text: 'Tied to a single phone and a habit you never quite build. The rest of your day is left alone.',
    icon: Shield,
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onLogin,
  onMindloop,
}) => {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-black text-white selection:bg-white/20">
      {/* Top Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 px-6 py-4 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-white/30 text-xs font-semibold text-white">
              {LANDING_INFO.mark}
            </span>
            <span className="text-base font-bold tracking-[0.2em]">
              {LANDING_INFO.name}
            </span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-xs text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#philosophy" className="text-xs text-white/60 hover:text-white transition-colors">
              Philosophy
            </a>
            <a href="#solution" className="text-xs text-white/60 hover:text-white transition-colors">
              Solution
            </a>
            <button
              type="button"
              onClick={onMindloop}
              className="text-xs text-accent hover:text-white transition-colors"
            >
              Mindloop Concept
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogin}
              className="text-xs font-medium text-white/70 hover:text-white transition-colors px-3 py-1.5"
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
      </header>

      {/* Hero Section */}
      <section id="top" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 text-center">
        {/* Background video */}
        <video
          src={LANDING_MEDIA.hero}
          muted
          autoPlay
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-40 pointer-events-none"
        />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80 backdrop-blur-md"
          >
            <Sparkles size={13} className="text-accent" />
            <span>7,000+ people let MANTRA handle the busywork</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-medium tracking-tight text-white sm:text-7xl md:text-8xl"
          >
            Your personal{' '}
            <span className="font-serif italic font-normal text-white/90">
              AI operating system
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            {LANDING_INFO.subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="pt-4 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            >
              Get Started Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onMindloop}
              className="liquid-glass rounded-full px-6 py-3.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Explore Mindloop
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it works & Comparisons */}
      <section id="how" className="relative px-6 py-28 md:py-36">
        <div className="mx-auto max-w-6xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-medium tracking-tight sm:text-6xl md:text-7xl"
          >
            The assistant era has{' '}
            <span className="font-serif italic font-normal text-accent">changed</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg"
          >
            The old ones still wait for one command at a time. MANTRA runs the whole task — across apps and services — from a single natural conversation.
          </motion.p>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {COMPARISON_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="liquid-glass rounded-2xl p-8 text-left hover:border-white/20 transition-colors"
                >
                  <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 aspect-video w-full relative">
            <video
              src={LANDING_MEDIA.mission}
              muted
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-16 space-y-10 text-left">
            <p className="text-2xl font-medium leading-relaxed tracking-tight text-white/90 sm:text-3xl md:text-4xl">
              MANTRA is a <span className="text-accent">personal intelligence</span> that studies your rhythm — what you repeat, what you put off, what you wish happened on its own.
            </p>
            <p className="text-xl font-normal leading-relaxed text-white/65 sm:text-2xl">
              It isn't another launcher or a louder search bar. It is a <span className="text-white">quiet operator</span> that turns a spoken sentence into a finished task, and remembers the way you like it done.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-accent">
            SOLUTION
          </p>
          <h2 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl md:text-7xl">
            Your time, quietly{' '}
            <span className="font-serif italic font-normal">returned</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg">
            MANTRA is built for the whole task, not the first step. Speak once and it handles the rest — while keeping you in charge of every move.
          </p>

          <div className="mt-14 aspect-[16/9] w-full max-w-4xl mx-auto overflow-hidden rounded-3xl border border-white/10">
            <video
              src={LANDING_MEDIA.solution}
              muted
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative px-6 py-24 text-center">
        <div className="liquid-glass mx-auto max-w-4xl rounded-3xl p-12 sm:p-20">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50">
            A HIGHER OPERATING STANDARD
          </p>
          <h2 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
            Ready to meet your system?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/70">
            Start talking with MANTRA immediately. No setup required.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            >
              Launch MANTRA
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="liquid-glass rounded-full px-6 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <footer className="mt-20 border-t border-white/10 pt-8 text-xs text-white/40">
          <p>© 2026 {LANDING_INFO.name}. Built as your personal AI operating system.</p>
        </footer>
      </section>
    </div>
  );
};
