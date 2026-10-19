import { AppItem, Contact, InterpreterResult, Task, TaskPriority } from '../types';
import { DEFAULT_APPS, DESKTOP_SYSTEM_APPS } from './constants';

function cleanInput(text: string): string {
  let t = text.trim();
  t = t.replace(/^(?:please\s+)?(?:can\s+you\s+|could\s+you\s+|would\s+you\s+|will\s+you\s+|i\s+want\s+you\s+to\s+|i'?d\s+like\s+you\s+to\s+|help\s+me\s+)?/i, '');
  t = t.replace(/\s+(?:for\s+me|please|now|then|thanks|thank\s+you|pls|plz)$/i, '');
  t = t.replace(/[?!,;:]+$/, '').trim();
  return t;
}

export function parseDate(text: string): { date: string; time: string; priority: TaskPriority; hadDate: boolean; hadTime: boolean } {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  let date = todayStr;
  let hadDate = false;

  const lower = text.toLowerCase();
  if (/\btomorrow\b/.test(lower)) {
    date = tomorrowStr;
    hadDate = true;
  } else if (/\btoday\b/.test(lower)) {
    date = todayStr;
    hadDate = true;
  }

  let time = '09:00';
  let hadTime = false;
  const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (timeMatch && (/\bat\b/.test(lower) || timeMatch[3])) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3];
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    if (hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
      time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      hadTime = true;
    }
  }

  let priority: TaskPriority = 'medium';
  if (/\b(?:urgent|high|important|critical|asap)\b/i.test(lower)) {
    priority = 'high';
  } else if (/\b(?:low|casual|someday)\b/i.test(lower)) {
    priority = 'low';
  }

  return { date, time, priority, hadDate, hadTime };
}

export function findAppInText(text: string, apps: AppItem[] = DEFAULT_APPS): AppItem | null {
  const lower = ` ${text.toLowerCase().replace(/[^a-z0-9./+&' -]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  for (const app of apps) {
    const candidates = [app.name.toLowerCase(), app.domain.toLowerCase(), ...(app.aliases || []).map((a) => a.toLowerCase())];
    for (const phrase of candidates) {
      if (lower.includes(` ${phrase} `) || lower.includes(` ${phrase}.`) || lower.includes(`${phrase}.com`)) {
        return app;
      }
    }
  }
  return null;
}

export async function interpretCommand({
  input,
  apps = DEFAULT_APPS,
  tasks = [],
  contacts = [],
  onTaskAction,
  onOverlayToggle,
  onScreenshot,
}: {
  input: string;
  apps: AppItem[];
  tasks: Task[];
  contacts: Contact[];
  onTaskAction: (action: string, payload?: any) => Promise<any> | any;
  onOverlayToggle?: (enabled: boolean) => void;
  onScreenshot?: () => void;
}): Promise<InterpreterResult> {
  const trimmed = input.trim();
  const cleaned = cleanInput(trimmed);
  const lower = cleaned.toLowerCase();

  // 1. Time / Date queries
  if (/(?:what|current|now|\bthe\b)\s+\w*\s*(?:time|clock)|what time is it|time now/i.test(trimmed)) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return {
      content: `It is currently ${timeStr}.`,
      intent: { kind: 'time', confidence: 1 },
    };
  }

  if (/(?:what|today'?s|current|the)\s*[\w' ]*\b(?:date|day of the week|today|date is)\b.*|what day is it|what is today/i.test(trimmed)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return {
      content: `Today is ${dateStr}.`,
      intent: { kind: 'date', confidence: 1 },
    };
  }

  // 2. Smalltalk & Greetings
  if (/^(?:hi|hello|hey|yo|thanks|thank you|ok|okay|cool|nice)\b/i.test(lower) && lower.split(/\s+/).length <= 4) {
    const responses = [
      "Hey! I'm MANTRA, your personal AI operating system. How can I help you right now?",
      "Hello! Ready to take on your day. Need to launch an app, create a task, or check your schedule?",
      "Hey there! What's on your mind?",
    ];
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      intent: { kind: 'smalltalk', confidence: 0.95 },
    };
  }

  // 3. Screenshot
  if (/\b(?:take|capture|grab|make)\s+(?:a\s+|an\s+)?(?:screenshot|screen\s?shot|screen\s?capture)\b/i.test(lower) || /^(?:screenshot|screencap)\b/i.test(lower)) {
    if (onScreenshot) {
      onScreenshot();
    }
    return {
      content: "Capturing screenshot... Saved to your downloads / snapshot view.",
      actions: [{ label: 'View Snapshot', action: 'screenshot' }],
      intent: { kind: 'screenshot', confidence: 0.95 },
    };
  }

  // 4. Floating Avatar / Overlay toggle
  if (/\b(?:floating|overlay)\b/i.test(lower) || /^(?:turn|switch|toggle)\s+(?:on|off)\b.*\b(?:assistant|avatar|float|overlay)\b/i.test(lower)) {
    const isOff = /\b(?:off|disable|hide|stop|without|no\s+longer)\b/i.test(lower);
    const enabled = !isOff;
    if (onOverlayToggle) {
      onOverlayToggle(enabled);
    }
    return {
      content: enabled ? "Floating avatar is now active on your screen. You can drag it anywhere." : "Floating avatar overlay turned off.",
      actions: [{ label: enabled ? 'Hide Avatar' : 'Show Avatar', action: 'toggle_overlay' }],
      intent: { kind: 'overlay', confidence: 0.9 },
    };
  }

  // 5. Phone Call / Contact
  if (/^(?:please\s+)?(?:call|ring|phone|dial|facetime)\b/i.test(lower)) {
    const targetName = lower.replace(/^(?:please\s+)?(?:call|ring|phone|dial|facetime)\b/, '').replace(/^(?:my|the)\s+/i, '').trim();
    const contact = contacts.find(
      (c) => c.name.toLowerCase() === targetName || c.name.toLowerCase().includes(targetName) || (c.relation && c.relation.toLowerCase() === targetName)
    );
    if (contact) {
      window.location.href = `tel:${contact.number}`;
      return {
        content: `Calling ${contact.name} (${contact.number})...`,
        actions: [{ label: `Call ${contact.name}`, url: `tel:${contact.number}` }],
        intent: { kind: 'call', confidence: 0.95, contact: contact.name },
      };
    } else {
      return {
        content: `I don't have a contact for "${targetName}". You can add one in Settings → Contacts.`,
        actions: [{ label: 'Go to Settings', action: 'settings' }],
        intent: { kind: 'call', confidence: 0.8 },
      };
    }
  }

  // 6. Native desktop app disclaimer
  const isDesktopNative = DESKTOP_SYSTEM_APPS.some((p) => lower.includes(p));
  if (isDesktopNative && /\b(?:open|launch|run|start)\b/i.test(lower)) {
    return {
      content: `"${cleaned}" is a local desktop executable. In this web environment, MANTRA runs web apps, mobile services, and cloud tools directly. Try saying "Open Notion", "Open Spotify", or "Open YouTube"!`,
      intent: { kind: 'native_unsupported', confidence: 0.95 },
    };
  }

  // 7. Task Intents
  // SHOW_TODAY_TASKS
  if (/\b(?:today'?s?|todays)\b.*\btasks?\b|\btasks?\b.*\b(?:today|today'?s?)\b/i.test(lower)) {
    await onTaskAction('SHOW_TASKS');
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter((t) => t.status === 'todo' && t.date === today);
    return {
      content: todayTasks.length > 0
        ? `You have ${todayTasks.length} open task${todayTasks.length === 1 ? '' : 's'} today:\n` + todayTasks.map((t, idx) => `${idx + 1}. ${t.title} (${t.time})`).join('\n')
        : "You have no open tasks scheduled for today! Enjoy the headroom or add one anytime.",
      actions: [{ label: 'View Tasks', action: 'tasks' }],
      intent: { kind: 'task', task: 'SHOW_TODAY_TASKS', confidence: 0.9 },
    };
  }

  // CREATE_TASK
  if (/\b(?:create|add|make|new|remind\s+me\s+to)\b.*\btasks?\b|\btask\s+(?:to|for)\b|\badd\s+(?:a\s+)?(?:task|todo)\b|\bremind\s+me\s+(?:to|about)\b/i.test(lower)) {
    let taskTitle = cleaned
      .replace(/^(?:create|add|make|new|remind\s+me\s+to)\s+(?:a\s+)?(?:task|todo)\s+(?:to|for)?/i, '')
      .replace(/^(?:task\s+(?:to|for))\s+/i, '')
      .replace(/^(?:remind\s+me\s+(?:to|about))\s+/i, '')
      .replace(/\s+(?:tomorrow|today|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i, '')
      .trim();
    if (!taskTitle) taskTitle = 'New task';

    const { date, time, priority } = parseDate(cleaned);
    const newTask = await onTaskAction('CREATE_TASK', {
      title: taskTitle,
      date,
      time,
      priority,
    });

    return {
      content: `Created task: "${taskTitle}" for ${date} at ${time} (${priority} priority).`,
      actions: [{ label: 'Open Tasks', action: 'tasks' }],
      intent: { kind: 'task', task: 'CREATE_TASK', confidence: 0.95 },
    };
  }

  // COMPLETE_TASK
  if (/\b(?:complete|finish|done\s+with|mark)\b.*\btasks?\b|\bcomplete\s+my\b/i.test(lower)) {
    const todoTasks = tasks.filter((t) => t.status === 'todo');
    const matched = todoTasks.find((t) => lower.includes(t.title.toLowerCase()) || t.title.toLowerCase().includes(lower));
    if (matched) {
      await onTaskAction('COMPLETE_TASK', { id: matched.id });
      return {
        content: `Marked "${matched.title}" as completed! Great job.`,
        intent: { kind: 'task', task: 'COMPLETE_TASK', confidence: 0.95 },
      };
    } else {
      await onTaskAction('SHOW_TASKS');
      return {
        content: "Here are your current open tasks. You can click the checkmark on any task to complete it.",
        actions: [{ label: 'View Tasks', action: 'tasks' }],
        intent: { kind: 'task', task: 'SHOW_TASKS', confidence: 0.8 },
      };
    }
  }

  // SHOW_TASKS
  if (/\b(?:show|list|view|display|open)\b.*\btasks?\b|\bmy\s+tasks\b|\btodo\s+list\b/i.test(lower)) {
    await onTaskAction('SHOW_TASKS');
    return {
      content: `Opening your Tasks board. You currently have ${tasks.filter((t) => t.status === 'todo').length} open items.`,
      actions: [{ label: 'View Tasks', action: 'tasks' }],
      intent: { kind: 'task', task: 'SHOW_TASKS', confidence: 0.9 },
    };
  }

  // SHOW_INSIGHTS
  if (/\b(?:my\s+)?(?:productivity|progress|stats|statistics|insights|how\s+(?:am|i)\s+doing)\b/i.test(lower)) {
    await onTaskAction('SHOW_INSIGHTS');
    return {
      content: "Opening your Insights dashboard — showing completion rates, weekly streaks, and activity patterns.",
      actions: [{ label: 'View Insights', action: 'insights' }],
      intent: { kind: 'task', task: 'SHOW_INSIGHTS', confidence: 0.9 },
    };
  }

  // SHOW_HISTORY
  if (/\b(?:command\s+)?history\b|\bwhat\s+did\s+(?:i|we)\s+(?:do|run|search)\b|\brecent\s+(?:commands|searches)\b/i.test(lower)) {
    await onTaskAction('SHOW_HISTORY');
    return {
      content: "Opening your Command History.",
      actions: [{ label: 'View History', action: 'history' }],
      intent: { kind: 'task', task: 'SHOW_HISTORY', confidence: 0.9 },
    };
  }

  // SHOW_APPS
  if (/\b(?:show|list|open|view|all)\b.*\b(?:apps?|websites?|sites?)\b/i.test(lower)) {
    await onTaskAction('SHOW_APPS');
    return {
      content: `Opening your Apps catalog (${apps.length} apps available).`,
      actions: [{ label: 'View Apps', action: 'apps' }],
      intent: { kind: 'task', task: 'SHOW_APPS', confidence: 0.9 },
    };
  }

  // SHOW_SETTINGS
  if (/\b(?:open|show|view|change)?\s*settings\b|\bpreferences\b/i.test(lower)) {
    await onTaskAction('SHOW_SETTINGS');
    return {
      content: "Opening Settings where you can adjust themes, voice preferences, avatar appearance, and reminder times.",
      actions: [{ label: 'View Settings', action: 'settings' }],
      intent: { kind: 'task', task: 'SHOW_SETTINGS', confidence: 0.9 },
    };
  }

  // 8. Open App or Search on App
  const matchedApp = findAppInText(lower, apps);
  const isOpenVerb = /\b(?:open|launch|go\s+to|goto|visit|browse|take\s+me\s+to)\b/i.test(lower);
  const isSearchVerb = /\b(?:search|find|look\s+up|google|query)\b/i.test(lower);

  if (matchedApp) {
    if (isSearchVerb && matchedApp.searchUrl) {
      // Extract search query
      const query = cleaned
        .replace(new RegExp(`\\b(?:search|find|look\\s+up|query|on|in|for|at|using|via|${matchedApp.name}|${matchedApp.domain})\\b`, 'gi'), '')
        .trim();
      const finalUrl = matchedApp.searchUrl.replace('{q}', encodeURIComponent(query || ''));
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      return {
        content: `Searching for "${query || matchedApp.name}" on ${matchedApp.name}...`,
        actions: [{ label: `Open ${matchedApp.name}`, url: finalUrl }],
        intent: { kind: 'search_website', site: matchedApp, query, confidence: 0.95 },
      };
    }

    // Direct open
    window.open(matchedApp.url, '_blank', 'noopener,noreferrer');
    return {
      content: `Opening ${matchedApp.name} (${matchedApp.domain})...`,
      actions: [{ label: `Open ${matchedApp.name}`, url: matchedApp.url }],
      intent: { kind: 'open_website', site: matchedApp, confidence: 0.95 },
    };
  }

  // 9. General Search
  if (isSearchVerb) {
    const q = cleaned.replace(/^(?:search|find|look\s+up|google)\s+(?:for\s+)?/i, '').trim();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    return {
      content: `Searching the web for "${q}"...`,
      actions: [{ label: 'Google Search', url: searchUrl }],
      intent: { kind: 'search_web', query: q, confidence: 0.9 },
    };
  }

  // 10. Direct URL
  if (/^https?:\/\//i.test(cleaned) || /\.[a-z]{2,}(?:\/.*)?$/i.test(cleaned)) {
    const url = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return {
      content: `Navigating to ${url}...`,
      actions: [{ label: 'Open Link', url }],
      intent: { kind: 'open_website', url, confidence: 0.95 },
    };
  }

  // 11. Intelligent Answer / Fallback
  return {
    content: `Here is what I found for "${trimmed}":\n\nMANTRA has logged your request. You can also turn this into a scheduled task, search across connected apps, or open related productivity tools.`,
    actions: [
      { label: `Search "${trimmed.slice(0, 24)}"`, url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}` },
      { label: 'Create Task', action: 'CREATE_TASK' },
    ],
    intent: { kind: 'answer', confidence: 0.7 },
  };
}
