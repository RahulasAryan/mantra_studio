import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Mic,
  Volume2,
  Bell,
  Palette,
  Users,
  Database,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  Check,
} from 'lucide-react';
import { Avatar } from '../Avatar';
import { AvatarAnimation, AvatarShape, DailyReminder, Settings } from '../../types';

interface SettingsViewProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClearTasks: () => void;
  onClearHistory: () => void;
  onResetAll: () => void;
  reminder: DailyReminder;
  onUpdateReminder: (r: Partial<DailyReminder>) => void;
  onEnableReminder: () => Promise<boolean>;
}

const COLOR_PRESETS = [
  { name: 'Purple', hex: '#9a84ff' },
  { name: 'Teal', hex: '#4fd1c5' },
  { name: 'Rose', hex: '#f472b6' },
  { name: 'Amber', hex: '#fbbf24' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Blue', hex: '#60a5fa' },
  { name: 'Coral', hex: '#fb7185' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdate,
  onClearTasks,
  onClearHistory,
  onResetAll,
  reminder,
  onUpdateReminder,
  onEnableReminder,
}) => {
  // New contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newContact = {
      id: Math.random().toString(36).slice(2, 10),
      name: newContactName.trim(),
      number: newContactPhone.trim(),
      relation: newContactRelation.trim() || undefined,
    };
    onUpdate({ contacts: [...settings.contacts, newContact] });
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
  };

  const handleRemoveContact = (id: string) => {
    onUpdate({ contacts: settings.contacts.filter((c) => c.id !== id) });
  };

  const handleExportData = () => {
    const raw = localStorage.getItem('mantra');
    const blob = new Blob([raw || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      const ok = await onEnableReminder();
      onUpdateReminder({ enabled: ok });
    } else {
      onUpdateReminder({ enabled: false });
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-xs text-muted">
          All preferences and local models are stored securely in your browser.
        </p>
      </header>

      {/* Profile & User Name */}
      <section className="card p-5 space-y-4">
        <h2 className="label">Profile</h2>
        <div>
          <label className="text-xs text-muted block mb-1.5">Display Name</label>
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => onUpdate({ userName: e.target.value })}
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
            placeholder="Your name"
          />
        </div>
      </section>

      {/* Theme */}
      <section className="card p-5 space-y-4">
        <h2 className="label">Theme & Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.theme === 'dark' ? <Moon size={18} className="text-accent" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <p className="text-xs font-medium text-ink">Dark Mode</p>
              <p className="text-2xs text-muted">Toggle between dark and light themes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.theme === 'dark' ? 'bg-accent' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Avatar Appearance Customization */}
      <section className="card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-accent" />
          <h2 className="label">Avatar Appearance</h2>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-elevated/40 border border-line">
          <Avatar
            state="idle"
            size={settings.avatarSize}
            color={settings.avatarColor}
            shape={settings.avatarShape}
            animation={settings.avatarAnimation}
          />
          <p className="mt-3 text-2xs text-muted">Live Avatar Preview</p>
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-xs text-muted block mb-2">Color Aura</label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onUpdate({ avatarColor: preset.hex })}
                className="relative grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                {settings.avatarColor === preset.hex && (
                  <Check size={14} className="text-black font-bold" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Shape */}
        <div>
          <label className="text-xs text-muted block mb-2">Shape</label>
          <div className="grid grid-cols-3 gap-2">
            {(['circle', 'squircle', 'rounded'] as AvatarShape[]).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => onUpdate({ avatarShape: shape })}
                className={`rounded-xl border py-2 text-xs capitalize transition-colors ${
                  settings.avatarShape === shape
                    ? 'border-accent bg-accent/15 text-accent font-semibold'
                    : 'border-line bg-elevated text-muted hover:text-ink'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Style */}
        <div>
          <label className="text-xs text-muted block mb-2">Animation Rhythm</label>
          <div className="grid grid-cols-3 gap-2">
            {(['calm', 'normal', 'lively'] as AvatarAnimation[]).map((anim) => (
              <button
                key={anim}
                type="button"
                onClick={() => onUpdate({ avatarAnimation: anim })}
                className={`rounded-xl border py-2 text-xs capitalize transition-colors ${
                  settings.avatarAnimation === anim
                    ? 'border-accent bg-accent/15 text-accent font-semibold'
                    : 'border-line bg-elevated text-muted hover:text-ink'
                }`}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Size Slider */}
        <div>
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>Avatar Size</span>
            <span className="font-semibold text-ink">{settings.avatarSize}px</span>
          </div>
          <input
            type="range"
            min="100"
            max="180"
            step="4"
            value={settings.avatarSize}
            onChange={(e) => onUpdate({ avatarSize: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
      </section>

      {/* Voice & Assistant Settings */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mic size={16} className="text-accent" />
          <h2 className="label">Voice & Floating Assistant</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink">Floating Avatar</p>
            <p className="text-2xs text-muted">Keep avatar draggable across any screen</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ assistantEnabled: !settings.assistantEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.assistantEnabled ? 'bg-accent' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.assistantEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div>
            <p className="text-xs font-medium text-ink">Always Listening / Wake Word</p>
            <p className="text-2xs text-muted">Trigger assistant hands-free with wake word</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ alwaysListening: !settings.alwaysListening })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.alwaysListening ? 'bg-accent' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.alwaysListening ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.alwaysListening && (
          <div className="pt-2">
            <label className="text-2xs text-muted block mb-1">Wake Word Phrase</label>
            <input
              type="text"
              value={settings.wakeWord}
              onChange={(e) => onUpdate({ wakeWord: e.target.value })}
              className="w-full rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              placeholder="hey bits"
            />
          </div>
        )}

        {/* TTS Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div className="flex items-center gap-2.5">
            <Volume2 size={16} className="text-muted" />
            <div>
              <p className="text-xs font-medium text-ink">Spoken Responses (TTS)</p>
              <p className="text-2xs text-muted">Read out assistant replies automatically</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpdate({ ttsEnabled: !settings.ttsEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.ttsEnabled ? 'bg-accent' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.ttsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Daily Reminders */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-accent" />
          <h2 className="label">Daily Reminder</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink">Daily Check-in Notification</p>
            <p className="text-2xs text-muted">A gentle nudge with your open tasks</p>
          </div>
          <button
            type="button"
            onClick={() => handleReminderToggle(!reminder.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reminder.enabled ? 'bg-accent' : 'bg-elevated'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reminder.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {reminder.enabled && (
          <div className="pt-2">
            <label className="text-2xs text-muted block mb-1">Scheduled Time</label>
            <input
              type="time"
              value={reminder.time}
              onChange={(e) => onUpdateReminder({ time: e.target.value })}
              className="rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
            />
          </div>
        )}
      </section>

      {/* Contacts / Speed Dial */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-accent" />
          <h2 className="label">Contacts & Speed Dial</h2>
        </div>
        <p className="text-2xs text-muted">
          Add names and numbers so commands like "Call Mom" work directly.
        </p>

        {settings.contacts.length > 0 && (
          <ul className="space-y-2">
            {settings.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-line bg-elevated/40 p-2.5 text-xs"
              >
                <div>
                  <span className="font-medium text-ink">{c.name}</span>
                  {c.relation && <span className="ml-2 text-2xs text-accent">({c.relation})</span>}
                  <p className="text-2xs text-muted">{c.number}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(c.id)}
                  className="text-faint hover:text-danger p-1"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} className="pt-2 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Name"
              className="rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              required
            />
            <input
              type="tel"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              placeholder="Phone number"
              className="rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              required
            />
            <input
              type="text"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
              placeholder="Relation (e.g. Mom)"
              className="rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-2xs font-semibold text-black hover:opacity-90"
          >
            <Plus size={12} /> Add Contact
          </button>
        </form>
      </section>

      {/* Data Management */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-accent" />
          <h2 className="label">Data & Backup</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-elevated/50 py-2.5 text-xs font-medium text-ink hover:border-accent transition-colors"
          >
            <Download size={14} /> Export Backup (JSON)
          </button>
          <button
            type="button"
            onClick={onClearTasks}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-elevated/50 py-2.5 text-xs font-medium text-muted hover:text-danger hover:border-danger/30 transition-colors"
          >
            <Trash2 size={14} /> Clear All Tasks
          </button>
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-elevated/50 py-2.5 text-xs font-medium text-muted hover:text-danger hover:border-danger/30 transition-colors"
          >
            <Trash2 size={14} /> Clear Command Logs
          </button>
          <button
            type="button"
            onClick={onResetAll}
            className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 py-2.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
          >
            <RotateCcw size={14} /> Reset All to Default
          </button>
        </div>
      </section>
    </div>
  );
};
