import React, { useState, useRef, useMemo } from 'react';
import { Mic, MicOff, Send, CheckSquare, Grid, History as HistoryIcon, BarChart2, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { Avatar } from '../Avatar';
import { useAssistant } from '../../lib/assistant-context';
import { AppView, AvatarAnimation, AvatarShape, HistoryItem, Task } from '../../types';

interface HomeViewProps {
  tasks: Task[];
  history: HistoryItem[];
  userName: string;
  onNavigate: (view: AppView) => void;
  avatar: {
    color: string;
    shape: AvatarShape;
    size: number;
    animation: AvatarAnimation;
  };
}

function getGreeting(hour: number): string {
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}

export const HomeView: React.FC<HomeViewProps> = ({
  tasks,
  userName,
  onNavigate,
  avatar,
}) => {
  const {
    state,
    voiceSupported,
    startListening,
    stopListening,
    listening,
    ask,
    transcript,
    chat,
  } = useAssistant();

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const displayName = userName.trim() || 'there';

  // Today's open tasks
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const openTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'todo').slice(0, 4);
  }, [tasks]);

  // Last assistant reply
  const latestAssistantMessage = useMemo(() => {
    const messages = chat.active?.messages || [];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && !messages[i].pending && messages[i].content) {
        return messages[i].content;
      }
    }
    return '';
  }, [chat.active]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    ask(input.trim());
    setInput('');
  };

  const handleAvatarTap = () => {
    if (listening) {
      stopListening();
      return;
    }
    if (voiceSupported) {
      startListening();
    } else {
      inputRef.current?.focus();
    }
  };

  const QUICK_ACTIONS = [
    { label: 'Tasks', icon: CheckSquare, view: 'tasks' as AppView },
    { label: 'Apps', icon: Grid, view: 'apps' as AppView },
    { label: 'History', icon: HistoryIcon, view: 'history' as AppView },
    { label: 'Insights', icon: BarChart2, view: 'insights' as AppView },
    { label: 'Chat', icon: MessageSquare, view: 'chat' as AppView },
  ];

  const SUGGESTION_PILLS = [
    'Open YouTube',
    'What are my tasks today?',
    'Take a screenshot',
    'Add task to study at 4pm',
    'Open ChatGPT',
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 py-4 sm:py-8">
      {/* Greeting Header */}
      <header className="w-full text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-faint font-medium">
          {greeting}
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          {displayName}
        </h1>
      </header>

      {/* Central Interactive Avatar */}
      <section className="flex flex-col items-center gap-4">
        <Avatar
          state={state}
          size={avatar.size || 140}
          color={avatar.color}
          shape={avatar.shape}
          animation={avatar.animation}
          onTap={handleAvatarTap}
          onLongPress={() => onNavigate('settings')}
          label={listening ? 'Stop listening' : 'Tap to talk to MANTRA'}
        />

        <div className="text-center h-6">
          {listening ? (
            <p className="text-xs font-medium text-accent animate-pulse">
              Listening... {transcript ? `"${transcript}"` : 'Speak now'}
            </p>
          ) : state === 'thinking' ? (
            <p className="text-xs font-medium text-muted animate-pulse">
              Thinking...
            </p>
          ) : state === 'speaking' ? (
            <p className="text-xs font-medium text-accent">
              Speaking...
            </p>
          ) : (
            <p className="text-xs text-muted">
              Tap avatar or speak anytime. Hold for settings.
            </p>
          )}
        </div>
      </section>

      {/* Natural Language Input Bar */}
      <section className="w-full max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-2xl border border-line bg-card p-1.5 shadow-lg transition-all focus-within:border-accent"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a task, search web, or launch an app..."
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${
              listening
                ? 'bg-accent/20 text-accent animate-pulse'
                : 'text-muted hover:text-ink hover:bg-elevated'
            }`}
            title={listening ? 'Stop listening' : 'Voice input'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-black disabled:opacity-30 hover:opacity-90 transition-opacity"
            title="Send"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Suggestion pills */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {SUGGESTION_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => ask(pill)}
              className="rounded-full border border-line bg-elevated/40 px-3 py-1 text-xs text-muted hover:text-ink hover:border-accent/40 transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>
      </section>

      {/* Latest Assistant Message Callout */}
      {latestAssistantMessage && (
        <section className="w-full max-w-xl rounded-2xl border border-line bg-elevated/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2 text-2xs uppercase tracking-wider text-faint">
            <MessageSquare size={12} className="text-accent" />
            <span>Latest from MANTRA</span>
          </div>
          <p className="text-xs text-ink/90 leading-relaxed whitespace-pre-wrap">
            {latestAssistantMessage}
          </p>
        </section>
      )}

      {/* Quick Nav Grid */}
      <section className="grid grid-cols-5 gap-2 w-full max-w-xl">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.view)}
              className="card flex flex-col items-center justify-center p-3 text-center transition-all hover:bg-elevated hover:scale-[1.02]"
            >
              <Icon size={18} className="text-muted mb-1.5" />
              <span className="text-xs font-medium text-ink">{item.label}</span>
            </button>
          );
        })}
      </section>

      {/* Open Tasks Section */}
      <section className="w-full max-w-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">
              Open Tasks
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            All tasks ({tasks.length}) <ArrowRight size={13} />
          </button>
        </div>

        {openTasks.length === 0 ? (
          <div className="card p-6 text-center text-xs text-muted">
            No open tasks! Type "Add task to read docs" or use the Tasks tab.
          </div>
        ) : (
          <ul className="card divide-y divide-line overflow-hidden">
            {openTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 text-xs">
                <span className="font-medium text-ink truncate mr-3">{t.title}</span>
                <span className="flex items-center gap-1 text-muted shrink-0 text-2xs">
                  <Clock size={11} /> {t.time}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
