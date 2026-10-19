import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AvatarState, ChatMessage, ChatSession, Settings, Task } from '../types';
import { useSpeechSynthesis, useSpeechRecognition, useWakeWord } from './speech';
import { interpretCommand } from './interpreter';
import { getStoredChats, saveStoredChats, getActiveChatId, setActiveChatId } from './storage';

interface AssistantContextType {
  state: AvatarState;
  listening: boolean;
  voiceSupported: boolean;
  transcript: string;
  voiceError: string | null;
  startListening: () => void;
  stopListening: () => void;
  ask: (query: string, attachments?: any[]) => Promise<void>;
  speak: (text: string) => void;
  cancelSpeech: () => void;
  speaking: boolean;
  assistantEnabled: boolean;
  setAssistantEnabled: (enabled: boolean) => void;
  alwaysListening: boolean;
  setAlwaysListening: (enabled: boolean) => void;
  wakeWord: string;
  chat: {
    conversations: ChatSession[];
    activeId: string | null;
    active: ChatSession | null;
    busy: boolean;
    send: (content: string, attachments?: any[]) => Promise<void>;
    stop: () => void;
    newChat: () => void;
    selectChat: (id: string) => void;
    deleteChat: (id: string) => void;
    clearHistory: () => void;
    filter: string;
    setFilter: (f: string) => void;
  };
}

const AssistantContext = createContext<AssistantContextType | null>(null);

export function useAssistant(): AssistantContextType {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant must be used inside <AssistantProvider>');
  }
  return ctx;
}

export function AssistantProvider({
  settings,
  tasks,
  apps,
  onTaskAction,
  onViewChange,
  onHistory,
  onUpdateSettings,
  onScreenshot,
  children,
}: {
  settings: Settings;
  tasks: Task[];
  apps: any[];
  onTaskAction: (action: string, payload?: any) => Promise<any> | any;
  onViewChange: (view: any) => void;
  onHistory: (cmd: string, ok: boolean, kind?: string) => void;
  onUpdateSettings: (s: Partial<Settings>) => void;
  onScreenshot?: () => void;
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<ChatSession[]>(() => {
    const list = getStoredChats();
    if (list.length > 0) return list;
    const initial: ChatSession = {
      id: Math.random().toString(36).slice(2, 10),
      title: 'Welcome to MANTRA',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'welcome-1',
          role: 'assistant',
          content: "Hello! I am MANTRA, your personal AI operating system.\n\nYou can ask me to open web apps, search for tutorials, set reminders, schedule daily tasks, or take screenshots. Tap the microphone or type below to begin.",
          createdAt: Date.now(),
        },
      ],
    };
    return [initial];
  });

  const [activeId, setActiveIdState] = useState<string | null>(() => {
    const stored = getActiveChatId();
    if (stored) return stored;
    return conversations[0]?.id || null;
  });

  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [transcript, setTranscript] = useState('');
  const [avatarEffect, setAvatarEffect] = useState<'success' | 'error' | null>(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    saveStoredChats(conversations);
  }, [conversations]);

  useEffect(() => {
    setActiveChatId(activeId);
  }, [activeId]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tts = useSpeechSynthesis({
    enabled: settings.ttsEnabled,
    lang: settings.speechLang,
    rate: settings.speechRate,
    pitch: 1,
    voiceURI: settings.voiceURI,
    preferFemale: settings.femaleVoice,
  });

  const handleVoiceInput = useCallback((text: string) => {
    setTranscript(text);
    if (text.trim()) {
      executeAsk(text);
    }
  }, []);

  const stt = useSpeechRecognition(settings.voiceEnabled, handleVoiceInput);

  const wake = useWakeWord({
    enabled: settings.assistantEnabled && settings.alwaysListening,
    wakeWord: settings.wakeWord || 'hey bits',
    onCommand: (cmd) => executeAsk(cmd),
    onStop: () => {
      tts.cancel();
      stt.stop();
    },
  });

  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || conversations[0] || null;
  }, [conversations, activeId]);

  const selectChat = useCallback((id: string) => {
    setActiveIdState(id);
    setFilter('');
  }, []);

  const newChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).slice(2, 10),
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newSession, ...prev]);
    setActiveIdState(newSession.id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: Math.random().toString(36).slice(2, 10),
          title: 'New conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        return [fresh];
      }
      return filtered;
    });
    if (activeId === id) {
      setActiveIdState(conversations.find((c) => c.id !== id)?.id || null);
    }
  }, [activeId, conversations]);

  const clearHistory = useCallback(() => {
    const fresh: ChatSession = {
      id: Math.random().toString(36).slice(2, 10),
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([fresh]);
    setActiveIdState(fresh.id);
  }, []);

  const executeAsk = useCallback(
    async (query: string, attachments: any[] = []) => {
      const q = query.trim();
      if (!q || busy) return;

      tts.cancel();
      setTranscript(q);
      setBusy(true);

      let targetSessionId = activeId;
      if (!targetSessionId || !conversations.some((c) => c.id === targetSessionId)) {
        const created: ChatSession = {
          id: Math.random().toString(36).slice(2, 10),
          title: q.slice(0, 30),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setConversations((prev) => [created, ...prev]);
        setActiveIdState(created.id);
        targetSessionId = created.id;
      }

      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2, 10),
        role: 'user',
        content: q,
        createdAt: Date.now(),
        attachments: attachments.length ? attachments : undefined,
      };

      const pendingAssistantMsgId = Math.random().toString(36).slice(2, 10);
      const pendingAssistantMsg: ChatMessage = {
        id: pendingAssistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        pending: true,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetSessionId) {
            const isFirst = c.messages.length === 0;
            return {
              ...c,
              title: isFirst ? q.slice(0, 30) : c.title,
              updatedAt: Date.now(),
              messages: [...c.messages, userMsg, pendingAssistantMsg],
            };
          }
          return c;
        })
      );

      try {
        const res = await interpretCommand({
          input: q,
          apps,
          tasks,
          contacts: settings.contacts,
          onTaskAction,
          onOverlayToggle: (enabled) => onUpdateSettings({ assistantEnabled: enabled }),
          onScreenshot,
        });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetSessionId) {
              return {
                ...c,
                updatedAt: Date.now(),
                messages: c.messages.map((m) =>
                  m.id === pendingAssistantMsgId
                    ? {
                        ...m,
                        pending: false,
                        content: res.content,
                        sources: res.sources,
                        actions: res.actions,
                        error: res.error,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );

        onHistory(q, !res.error, res.intent.kind);
        setAvatarEffect(res.error ? 'error' : 'success');
        setTimeout(() => setAvatarEffect(null), 1600);

        if (settings.ttsEnabled && res.content) {
          tts.speak(res.content);
        }

        // View navigation if requested
        if (res.intent.task === 'SHOW_TASKS') onViewChange('tasks');
        if (res.intent.task === 'SHOW_APPS') onViewChange('apps');
        if (res.intent.task === 'SHOW_INSIGHTS') onViewChange('insights');
        if (res.intent.task === 'SHOW_HISTORY') onViewChange('history');
        if (res.intent.task === 'SHOW_SETTINGS') onViewChange('settings');
      } catch (err: any) {
        console.error('Interpreter error:', err);
        setAvatarEffect('error');
        setTimeout(() => setAvatarEffect(null), 1600);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetSessionId) {
              return {
                ...c,
                updatedAt: Date.now(),
                messages: c.messages.map((m) =>
                  m.id === pendingAssistantMsgId
                    ? {
                        ...m,
                        pending: false,
                        content: "I encountered an error executing that command. Please try again.",
                        error: true,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
        onHistory(q, false, 'error');
      } finally {
        setBusy(false);
      }
    },
    [
      activeId,
      conversations,
      busy,
      tts,
      apps,
      tasks,
      settings,
      onTaskAction,
      onUpdateSettings,
      onScreenshot,
      onHistory,
      onViewChange,
    ]
  );

  const startListening = useCallback(() => {
    tts.cancel();
    stt.start();
  }, [tts, stt]);

  const stopListening = useCallback(() => {
    stt.stop();
  }, [stt]);

  const state: AvatarState = useMemo(() => {
    if (!isOnline) return 'offline';
    if (avatarEffect) return avatarEffect;
    if (stt.listening || wake.armed) return 'listening';
    if (busy) return 'thinking';
    if (tts.speaking) return 'speaking';
    return 'idle';
  }, [isOnline, avatarEffect, stt.listening, wake.armed, busy, tts.speaking]);

  const value: AssistantContextType = {
    state,
    listening: stt.listening || wake.armed,
    voiceSupported: stt.supported,
    transcript,
    voiceError: stt.error,
    startListening,
    stopListening,
    ask: executeAsk,
    speak: tts.speak,
    cancelSpeech: tts.cancel,
    speaking: tts.speaking,
    assistantEnabled: settings.assistantEnabled,
    setAssistantEnabled: (enabled) => onUpdateSettings({ assistantEnabled: enabled }),
    alwaysListening: settings.alwaysListening,
    setAlwaysListening: (enabled) => onUpdateSettings({ alwaysListening: enabled }),
    wakeWord: settings.wakeWord,
    chat: {
      conversations,
      activeId,
      active: activeChat,
      busy,
      send: executeAsk,
      stop: () => setBusy(false),
      newChat,
      selectChat,
      deleteChat,
      clearHistory,
      filter,
      setFilter,
    },
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
