import { User, Task, HistoryItem, AppItem, Settings, DailyReminder, ChatSession } from '../types';
import { DEFAULT_APPS, INITIAL_SETTINGS } from './constants';

const KEY_DATA = 'mantra';
const KEY_AUTH = 'mantra.auth';
const KEY_USERS = 'mantra.users';
const KEY_CHATS = 'mantra.chats';
const KEY_ACTIVE_CHAT = 'mantra.chats.active';
const KEY_REMINDER = 'mantra.reminder';
const KEY_AVATAR_POS = 'mantra.avatar.pos';
const KEY_ONBOARDED = 'mantra.onboarded';

export interface AppStateData {
  tasks: Task[];
  history: HistoryItem[];
  apps: AppItem[];
  settings: Settings;
}

export function loadAppData(): AppStateData {
  const defaults: AppStateData = {
    tasks: [],
    history: [],
    apps: DEFAULT_APPS,
    settings: INITIAL_SETTINGS,
  };
  try {
    const raw = localStorage.getItem(KEY_DATA);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaults.tasks,
      history: Array.isArray(parsed.history) ? parsed.history : defaults.history,
      apps: Array.isArray(parsed.apps) && parsed.apps.length ? parsed.apps : defaults.apps,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return defaults;
  }
}

export function saveAppData(data: AppStateData): void {
  try {
    localStorage.setItem(KEY_DATA, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save app data', err);
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY_AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.email !== 'string') return null;
    const { password, ...user } = parsed;
    return user as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  try {
    if (!user) {
      localStorage.removeItem(KEY_AUTH);
    } else {
      localStorage.setItem(KEY_AUTH, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed to update stored user', err);
  }
}

export function getRegisteredUsers(): Array<User & { password?: string }> {
  try {
    const raw = localStorage.getItem(KEY_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: Array<User & { password?: string }>): void {
  try {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users', err);
  }
}

export function getStoredChats(): ChatSession[] {
  try {
    const raw = localStorage.getItem(KEY_CHATS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c.id === 'string' && Array.isArray(c.messages))
      .map((c) => ({
        id: c.id,
        title: typeof c.title === 'string' && c.title.trim() ? c.title : 'New chat',
        createdAt: Number(c.createdAt) || Date.now(),
        updatedAt: Number(c.updatedAt) || Number(c.createdAt) || Date.now(),
        messages: c.messages.filter((m: any) => m && typeof m.content === 'string').slice(-200),
      }))
      .slice(0, 100);
  } catch {
    return [];
  }
}

export function saveStoredChats(chats: ChatSession[]): void {
  try {
    localStorage.setItem(KEY_CHATS, JSON.stringify(chats));
  } catch (err) {
    console.error('Failed to save chats', err);
  }
}

export function getActiveChatId(): string | null {
  try {
    return localStorage.getItem(KEY_ACTIVE_CHAT);
  } catch {
    return null;
  }
}

export function setActiveChatId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(KEY_ACTIVE_CHAT, id);
    } else {
      localStorage.removeItem(KEY_ACTIVE_CHAT);
    }
  } catch {}
}

export function getStoredReminder(): DailyReminder {
  const def: DailyReminder = { enabled: false, time: '20:00', lastShown: '' };
  try {
    const raw = localStorage.getItem(KEY_REMINDER);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return {
      enabled: !!parsed.enabled,
      time: typeof parsed.time === 'string' && parsed.time ? parsed.time : def.time,
      lastShown: typeof parsed.lastShown === 'string' ? parsed.lastShown : '',
    };
  } catch {
    return def;
  }
}

export function saveStoredReminder(reminder: DailyReminder): void {
  try {
    localStorage.setItem(KEY_REMINDER, JSON.stringify(reminder));
  } catch {}
}

export function getStoredAvatarPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(KEY_AVATAR_POS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {}
  return null;
}

export function saveStoredAvatarPos(pos: { x: number; y: number }): void {
  try {
    localStorage.setItem(KEY_AVATAR_POS, JSON.stringify(pos));
  } catch {}
}

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY_ONBOARDED) === '1';
  } catch {
    return false;
  }
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(KEY_ONBOARDED, '1');
  } catch {}
}
