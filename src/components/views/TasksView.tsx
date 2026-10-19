import React, { useState, useMemo } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  Search,
  Filter,
  CheckSquare,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types';

interface TasksViewProps {
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completedAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // New task form state
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('09:00');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [formOpen, setFormOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle.trim(),
      date: newDate,
      time: newTime,
      priority: newPriority,
    });
    setNewTitle('');
    setNewTime('09:00');
    setFormOpen(false);
  };

  const handleStartEdit = (t: Task) => {
    setEditingId(t.id);
    setEditTitle(t.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  // Filter tasks
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch = !q || t.title.toLowerCase().includes(q);
      const matchPri = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchPri;
    });
  }, [tasks, search, filterPriority]);

  const groups = useMemo(() => {
    const currentDateTime = `${todayStr} ${nowTime}`;
    return {
      overdue: filtered.filter(
        (t) => t.status === 'todo' && `${t.date} ${t.time}`.localeCompare(currentDateTime) < 0
      ),
      today: filtered.filter(
        (t) => t.status === 'todo' && t.date === todayStr && `${t.date} ${t.time}`.localeCompare(currentDateTime) >= 0
      ),
      upcoming: filtered.filter((t) => t.status === 'todo' && t.date > todayStr),
      done: filtered.filter((t) => t.status === 'done'),
    };
  }, [filtered, todayStr, nowTime]);

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const renderTaskItem = (t: Task) => {
    const isDone = t.status === 'done';
    const isEditing = editingId === t.id;

    return (
      <li
        key={t.id}
        className="card flex items-center gap-3 px-4 py-3 transition-colors hover:border-accent/40"
      >
        <button
          type="button"
          onClick={() => onToggle(t.id)}
          aria-label={isDone ? `Mark ${t.title} as incomplete` : `Mark ${t.title} as complete`}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all ${
            isDone
              ? 'border-accent bg-accent text-white'
              : 'border-line text-transparent hover:border-accent'
          }`}
        >
          <Check size={13} strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSaveEdit(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(t.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="w-full rounded bg-elevated px-2 py-0.5 text-xs text-ink focus:outline-none"
            />
          ) : (
            <p
              onClick={() => handleStartEdit(t)}
              className={`truncate text-xs cursor-pointer ${
                isDone ? 'line-through text-muted' : 'text-ink font-medium'
              }`}
            >
              {t.title}
            </p>
          )}

          <div className="mt-1 flex items-center gap-3 text-2xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {t.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {t.time}
            </span>
            <span
              className={`rounded px-1.5 py-0.2 capitalize ${
                t.priority === 'high'
                  ? 'bg-danger/15 text-danger font-medium'
                  : t.priority === 'low'
                  ? 'bg-elevated text-faint'
                  : 'bg-accent/15 text-accent'
              }`}
            >
              {t.priority}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(t.id)}
          className="text-faint hover:text-danger p-1 transition-colors"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </li>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">
            Tasks
          </h1>
          <p className="mt-1 text-xs text-muted">
            {doneCount} of {totalCount} completed ({completionRate}%).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> New Task
        </button>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* New Task Form */}
      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="card p-4 space-y-3 border-accent/40 bg-card animate-in fade-in duration-150"
        >
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
            Create a task
          </h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to get done?"
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
            autoFocus
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="label block mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="label block mb-1">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="label block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-line px-3 py-1.5 text-xs text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-ink px-4 py-1.5 text-xs font-semibold text-black hover:opacity-90"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-line bg-elevated py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-line bg-elevated p-1 text-2xs">
          {['all', 'high', 'medium', 'low'].map((pri) => (
            <button
              key={pri}
              type="button"
              onClick={() => setFilterPriority(pri)}
              className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                filterPriority === pri
                  ? 'bg-card text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue */}
        {groups.overdue.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-danger text-xs font-semibold uppercase tracking-wider">
              <AlertCircle size={14} /> Overdue ({groups.overdue.length})
            </div>
            <ul className="space-y-2">{groups.overdue.map(renderTaskItem)}</ul>
          </section>
        )}

        {/* Today */}
        <section className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-faint">
            Today ({groups.today.length})
          </div>
          {groups.today.length === 0 ? (
            <div className="card p-4 text-center text-xs text-muted">
              No pending tasks for today.
            </div>
          ) : (
            <ul className="space-y-2">{groups.today.map(renderTaskItem)}</ul>
          )}
        </section>

        {/* Upcoming */}
        {groups.upcoming.length > 0 && (
          <section className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-faint">
              Upcoming ({groups.upcoming.length})
            </div>
            <ul className="space-y-2">{groups.upcoming.map(renderTaskItem)}</ul>
          </section>
        )}

        {/* Completed */}
        {groups.done.length > 0 && (
          <section className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              Completed ({groups.done.length})
            </div>
            <ul className="space-y-2 opacity-75">{groups.done.map(renderTaskItem)}</ul>
          </section>
        )}
      </div>
    </div>
  );
};
