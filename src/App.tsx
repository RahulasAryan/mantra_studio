import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AppView, DailyReminder, Route, Task, User, Settings } from './types';
import {
  loadAppData,
  saveAppData,
  getStoredUser,
  setStoredUser,
  getRegisteredUsers,
  saveRegisteredUsers,
  getStoredReminder,
  saveStoredReminder,
  isOnboarded,
  setOnboarded,
} from './lib/storage';
import { DEFAULT_APPS, INITIAL_SETTINGS, DEFAULT_SCHEDULE_PLAN } from './lib/constants';
import { AssistantProvider } from './lib/assistant-context';

import { Navigation } from './components/Navigation';
import { FloatingAvatar } from './components/FloatingAvatar';
import { LandingView } from './components/views/LandingView';
import { MindloopView } from './components/views/MindloopView';
import { LoginView } from './components/views/LoginView';
import { RegisterView } from './components/views/RegisterView';
import { OnboardingView } from './components/views/OnboardingView';
import { HomeView } from './components/views/HomeView';
import { ChatView } from './components/views/ChatView';
import { TasksView } from './components/views/TasksView';
import { AppsView } from './components/views/AppsView';
import { HistoryView } from './components/views/HistoryView';
import { InsightsView } from './components/views/InsightsView';
import { SettingsView } from './components/views/SettingsView';

export function App() {
  const [appData, setAppData] = useState(() => loadAppData());
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [reminder, setReminder] = useState<DailyReminder>(() => getStoredReminder());
  const [route, setRoute] = useState<Route>(() => (getStoredUser() ? 'app' : 'landing'));
  const [view, setView] = useState<AppView>('home');
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboarded());

  const { tasks, history, apps, settings } = appData;

  // Persist app data
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Persist user auth
  useEffect(() => {
    setStoredUser(user);
  }, [user]);

  // Persist reminders
  useEffect(() => {
    saveStoredReminder(reminder);
  }, [reminder]);

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light');
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Update userName in settings if user logged in
  useEffect(() => {
    if (user?.name && user.name !== settings.userName && settings.userName === 'Local User') {
      setAppData((prev) => ({
        ...prev,
        settings: { ...prev.settings, userName: user.name },
      }));
    }
  }, [user, settings.userName]);

  // Daily reminder notification checker
  useEffect(() => {
    if (!reminder.enabled || typeof window === 'undefined' || !('Notification' in window)) return;

    const interval = window.setInterval(() => {
      const now = new Date();
      const currentHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().slice(0, 10);

      if (currentHMM === reminder.time && reminder.lastShown !== todayStr) {
        if (Notification.permission === 'granted') {
          const todayTasksCount = tasks.filter((t) => t.status === 'todo' && t.date === todayStr).length;
          const msg = todayTasksCount > 0
            ? `You have ${todayTasksCount} open task${todayTasksCount === 1 ? '' : 's'} today. Open MANTRA to stay in rhythm!`
            : 'No open tasks today — enjoy your day!';
          new Notification('MANTRA Daily Reminder', { body: msg, icon: '/mantra.svg' });
          setReminder((prev) => ({ ...prev, lastShown: todayStr }));
        }
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [reminder, tasks]);

  // State update helpers
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const addHistory = useCallback((command: string, ok: boolean, kind?: string) => {
    setAppData((prev) => ({
      ...prev,
      history: [
        {
          id: Math.random().toString(36).slice(2, 10),
          command,
          status: ok ? ('success' as const) : ('error' as const),
          createdAt: Date.now(),
          kind: kind?.toLowerCase(),
        },
        ...prev.history,
      ].slice(0, 200),
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setAppData((prev) => ({ ...prev, history: [] }));
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).slice(2, 10),
      status: 'todo',
      createdAt: Date.now(),
      completedAt: null,
    };
    setAppData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    return newTask;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'todo' ? 'done' : 'todo',
              completedAt: t.status === 'todo' ? Date.now() : null,
            }
          : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const clearTasks = useCallback(() => {
    setAppData((prev) => ({ ...prev, tasks: [] }));
  }, []);

  const openApp = useCallback((app: any) => {
    setAppData((prev) => ({
      ...prev,
      apps: prev.apps.map((a) =>
        a.id === app.id ? { ...a, lastUsed: Date.now() } : a
      ),
    }));
    window.open(app.url, '_blank', 'noopener,noreferrer');
  }, []);

  const addCustomApp = useCallback((name: string, url: string): boolean => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const domain = parsed.hostname.replace(/^www\./, '');
      const newApp = {
        id: Math.random().toString(36).slice(2, 10),
        name: name.trim() || domain,
        domain,
        url: parsed.href,
        category: 'Custom',
        aliases: [],
        custom: true,
        favorite: false,
        lastUsed: Date.now(),
      };
      setAppData((prev) => ({
        ...prev,
        apps: [newApp, ...prev.apps],
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteApp = useCallback((id: string) => {
    setAppData((prev) => ({
      ...prev,
      apps: prev.apps.filter((a) => a.id !== id),
    }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setAppData((prev) => ({
      ...prev,
      apps: prev.apps.map((a) =>
        a.id === id ? { ...a, favorite: !a.favorite } : a
      ),
    }));
  }, []);

  const resetAll = useCallback(() => {
    const freshData = {
      tasks: [],
      history: [],
      apps: DEFAULT_APPS,
      settings: INITIAL_SETTINGS,
    };
    setAppData(freshData);
    saveAppData(freshData);
  }, []);

  // Dispatcher for natural language task actions from interpreter
  const handleTaskAction = useCallback(
    async (action: string, payload?: any) => {
      switch (action) {
        case 'CREATE_TASK': {
          return addTask(payload);
        }
        case 'COMPLETE_TASK': {
          toggleTask(payload.id);
          return true;
        }
        case 'SHOW_TASKS': {
          setView('tasks');
          return true;
        }
        case 'SHOW_INSIGHTS': {
          setView('insights');
          return true;
        }
        case 'SHOW_HISTORY': {
          setView('history');
          return true;
        }
        case 'SHOW_APPS': {
          setView('apps');
          return true;
        }
        case 'SHOW_SETTINGS': {
          setView('settings');
          return true;
        }
        case 'CREATE_PLAN': {
          const today = new Date().toISOString().slice(0, 10);
          for (const item of DEFAULT_SCHEDULE_PLAN) {
            addTask({
              title: item.title,
              date: today,
              time: item.time,
              priority: 'medium',
            });
          }
          setView('tasks');
          return true;
        }
        default:
          return null;
      }
    },
    [addTask, toggleTask]
  );

  // Authentication Handlers
  const handleLogin = async (email: string, pass: string) => {
    const users = getRegisteredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, error: 'No account found with this email. Try creating an account or continue as guest.' };
    }
    if (found.password && found.password !== pass) {
      return { ok: false, error: 'Incorrect password.' };
    }
    const { password, ...cleanUser } = found;
    setUser(cleanUser);
    setRoute('app');
    return { ok: true };
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const users = getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 10),
      name,
      email,
      createdAt: Date.now(),
    };
    saveRegisteredUsers([...users, { ...newUser, password: pass }]);
    setUser(newUser);
    setRoute('app');
    return { ok: true };
  };

  const handleGuest = () => {
    const guestUser: User = {
      id: `guest-${Math.random().toString(36).slice(2, 8)}`,
      name: 'Guest User',
      email: 'guest@mantra.local',
      guest: true,
      createdAt: Date.now(),
    };
    setUser(guestUser);
    setRoute('app');
  };

  const handleLogout = () => {
    setUser(null);
    setRoute('landing');
  };

  const handleEnableReminder = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const res = await Notification.requestPermission();
    return res === 'granted';
  };

  const handleFinishOnboarding = () => {
    setOnboarded();
    setShowOnboarding(false);
  };

  // Screenshot helper
  const handleScreenshot = () => {
    // Generate snapshot canvas or notify
    const dummy = document.createElement('canvas');
    dummy.width = window.innerWidth;
    dummy.height = window.innerHeight;
    const ctx = dummy.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, dummy.width, dummy.height);
      ctx.fillStyle = '#9a84ff';
      ctx.font = '24px sans-serif';
      ctx.fillText(`MANTRA Snapshot · ${new Date().toLocaleString()}`, 40, 80);
      try {
        const url = dummy.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `mantra-screenshot-${Date.now()}.png`;
        link.href = url;
        link.click();
      } catch {}
    }
  };

  // Render view router
  const renderCurrentView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView
            tasks={tasks}
            history={history}
            userName={settings.userName}
            onNavigate={setView}
            avatar={{
              color: settings.avatarColor,
              shape: settings.avatarShape,
              size: settings.avatarSize,
              animation: settings.avatarAnimation,
            }}
          />
        );
      case 'chat':
        return <ChatView voiceEnabled={settings.voiceEnabled} />;
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        );
      case 'apps':
        return (
          <AppsView
            apps={apps}
            onOpen={openApp}
            onAdd={addCustomApp}
            onDelete={deleteApp}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'history':
        return (
          <HistoryView
            history={history}
            onClear={clearHistory}
            onReRun={(cmd) => {
              setView('chat');
            }}
          />
        );
      case 'insights':
        return (
          <InsightsView
            tasks={tasks}
            history={history}
            apps={apps}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdate={updateSettings}
            onClearTasks={clearTasks}
            onClearHistory={clearHistory}
            onResetAll={resetAll}
            reminder={reminder}
            onUpdateReminder={(r) => setReminder((prev) => ({ ...prev, ...r }))}
            onEnableReminder={handleEnableReminder}
          />
        );
      default:
        return null;
    }
  };

  // Non-app routes
  if (route === 'landing') {
    return (
      <LandingView
        onGetStarted={() => setRoute('register')}
        onLogin={() => setRoute('login')}
        onMindloop={() => setRoute('mindloop')}
      />
    );
  }

  if (route === 'mindloop') {
    return (
      <MindloopView
        onBack={() => setRoute('landing')}
        onLogin={() => setRoute('login')}
        onGetStarted={() => setRoute('register')}
      />
    );
  }

  if (route === 'login') {
    return (
      <LoginView
        onSwitchToRegister={() => setRoute('register')}
        onBack={() => setRoute('landing')}
        onLogin={handleLogin}
        onGuest={handleGuest}
      />
    );
  }

  if (route === 'register') {
    return (
      <RegisterView
        onSwitchToLogin={() => setRoute('login')}
        onBack={() => setRoute('landing')}
        onRegister={handleRegister}
      />
    );
  }

  // App Route with AssistantProvider
  return (
    <AssistantProvider
      settings={settings}
      tasks={tasks}
      apps={apps}
      onTaskAction={handleTaskAction}
      onViewChange={setView}
      onHistory={addHistory}
      onUpdateSettings={updateSettings}
      onScreenshot={handleScreenshot}
    >
      <div className="relative min-h-dvh w-full overflow-x-hidden bg-bg">
        {/* Navigation Bar */}
        {!showOnboarding && (
          <Navigation
            view={view}
            onNavigate={setView}
            onLogout={handleLogout}
            userName={user?.name || settings.userName}
          />
        )}

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {showOnboarding ? (
            <OnboardingView
              name={user?.name || 'Explorer'}
              onDone={handleFinishOnboarding}
              onSkip={handleFinishOnboarding}
            />
          ) : (
            <motion.main
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={
                view === 'chat'
                  ? 'relative z-10 h-dvh overflow-hidden pt-16'
                  : 'relative z-10 min-h-dvh bg-bg px-4 pb-16 pt-20 sm:px-6'
              }
            >
              {renderCurrentView()}
            </motion.main>
          )}
        </AnimatePresence>

        {/* Floating Draggable Avatar (if enabled and not in home or onboarding) */}
        {!showOnboarding && view !== 'home' && settings.assistantEnabled && (
          <FloatingAvatar
            color={settings.avatarColor}
            shape={settings.avatarShape}
            animation={settings.avatarAnimation}
            onOpenSettings={() => setView('settings')}
            onOpenChat={() => setView('chat')}
          />
        )}
      </div>
    </AssistantProvider>
  );
}

export default App;
