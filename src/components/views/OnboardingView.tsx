import React from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckSquare, Sparkles } from 'lucide-react';
import { Avatar } from '../Avatar';

interface OnboardingViewProps {
  name: string;
  onDone: () => void;
  onSkip: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Globe,
    title: 'One-Sentence Reach',
    text: 'Ask to open apps, search YouTube, or browse the web with a simple spoken phrase or text prompt.',
  },
  {
    icon: CheckSquare,
    title: 'Effortless Tasks',
    text: 'Say "Add task to revise SQL tomorrow at 5pm" and MANTRA structures, schedules, and prioritizes it.',
  },
  {
    icon: Sparkles,
    title: 'Floating Companion',
    text: 'A tactile floating avatar that stays right where you need it with voice synthesis and audio reactivity.',
  },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  name,
  onDone,
  onSkip,
}) => {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-12">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-faint">
          Welcome, {name.trim() || 'friend'}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Meet MANTRA
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Your personal web assistant — it opens sites, searches the web, tracks tasks, and keeps your day organized.
        </p>
      </div>

      <div className="my-8 flex justify-center">
        <Avatar state="idle" size={108} color="#9a84ff" shape="circle" animation="normal" />
      </div>

      <ol className="space-y-3">
        {HIGHLIGHTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-4 rounded-2xl border border-line bg-card p-4.5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl bg-ink px-7 py-3 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
        >
          Get started
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-line bg-elevated/50 px-6 py-3 text-sm font-medium text-muted hover:text-ink transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
