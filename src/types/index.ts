export type Route = 'landing' | 'mindloop' | 'login' | 'register' | 'app';

export type AppView = 'home' | 'chat' | 'tasks' | 'apps' | 'history' | 'insights' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  guest?: boolean;
  createdAt: number;
}

export type TaskStatus = 'todo' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priority: TaskPriority;
  createdAt: number;
  completedAt?: number | null;
}

export interface HistoryItem {
  id: string;
  command: string;
  status: 'success' | 'error';
  createdAt: number;
  kind?: string;
}

export interface AppItem {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  aliases: string[];
  searchUrl?: string;
  custom: boolean;
  favorite: boolean;
  lastUsed?: number | null;
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  relation?: string;
}

export type AvatarShape = 'circle' | 'squircle' | 'rounded';
export type AvatarAnimation = 'calm' | 'normal' | 'lively';

export interface Settings {
  theme: 'dark' | 'light';
  voiceEnabled: boolean;
  userName: string;
  ttsEnabled: boolean;
  speechRate: number;
  speechLang: string;
  voiceURI: string;
  femaleVoice: boolean;
  avatarColor: string;
  avatarShape: AvatarShape;
  avatarSize: number;
  avatarAnimation: AvatarAnimation;
  assistantEnabled: boolean;
  alwaysListening: boolean;
  wakeWord: string;
  contacts: Contact[];
  shareTarget: 'system' | 'whatsapp' | 'clipboard';
}

export interface DailyReminder {
  enabled: boolean;
  time: string;
  lastShown?: string;
}

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'error' | 'offline';

export interface ChatAttachment {
  name: string;
  type: string;
  text?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  attachments?: ChatAttachment[];
  sources?: Array<{ title: string; snippet?: string; url?: string }>;
  actions?: Array<{ label: string; url?: string; action?: string; target?: string }>;
  notice?: string;
  error?: boolean;
  pending?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface InterpreterResult {
  content: string;
  sources?: Array<{ title: string; snippet?: string; url?: string }>;
  actions?: Array<{ label: string; url?: string; action?: string; target?: string }>;
  intent: {
    kind: string;
    confidence: number;
    reason?: string;
    task?: string;
    site?: AppItem;
    query?: string;
    contact?: string;
    url?: string;
  };
  notice?: string;
  error?: boolean;
}
