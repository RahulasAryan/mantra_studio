import React, { useMemo } from 'react';
import {
  CheckSquare,
  Flame,
  Clock,
  PieChart,
  BarChart,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { AppItem, HistoryItem, Task } from '../../types';

interface InsightsViewProps {
  tasks: Task[];
  history: HistoryItem[];
  apps: AppItem[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  tasks,
  history,
  apps,
}) => {
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status === 'todo'), [tasks]);

  const completionRate = useMemo(() => {
    return tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  }, [tasks, completedTasks]);

  // Streak calculation
  const streak = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    const completedDates = new Set(
      completedTasks
        .filter((t) => t.completedAt)
        .map((t) => new Date(t.completedAt!).toISOString().slice(0, 10))
    );

    let count = 0;
    const cur = new Date();
    while (true) {
      const dateStr = cur.toISOString().slice(0, 10);
      if (completedDates.has(dateStr)) {
        count++;
        cur.setDate(cur.getDate() - 1);
      } else {
        // If today not completed yet, check if yesterday was
        if (count === 0) {
          cur.setDate(cur.getDate() - 1);
          const yesterdayStr = cur.toISOString().slice(0, 10);
          if (completedDates.has(yesterdayStr)) {
            count++;
            cur.setDate(cur.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return count;
  }, [completedTasks]);

  // 7-day completion chart
  const weekData = useMemo(() => {
    const days: Array<{ label: string; date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'narrow' });
      const count = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toISOString().slice(0, 10) === dateStr;
      }).length;
      days.push({ label, date: dateStr, count });
    }
    return days;
  }, [completedTasks]);

  const maxDayCount = useMemo(() => {
    return Math.max(1, ...weekData.map((d) => d.count));
  }, [weekData]);

  // Top apps
  const topApps = useMemo(() => {
    return [...apps]
      .filter((a) => a.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, 4);
  }, [apps]);

  // Command breakdown by kind
  const commandKinds = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of history) {
      const k = h.kind || 'general';
      counts[k] = (counts[k] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">
          Insights & Productivity
        </h1>
        <p className="mt-1 text-xs text-muted">
          Real-time metrics computed directly from your tasks, command history, and app usage.
        </p>
      </header>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-faint">
            <CheckSquare size={14} className="text-accent" />
            <span className="label">Total Tasks</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{tasks.length}</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-faint">
            <TrendingUp size={14} className="text-success" />
            <span className="label">Completed</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{completedTasks.length}</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-faint">
            <Clock size={14} className="text-amber-400" />
            <span className="label">Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">{pendingTasks.length}</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-faint">
            <Flame size={14} className="text-danger" />
            <span className="label">Streak</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">
            {streak === 0 ? '—' : `${streak}d`}
          </p>
        </div>
      </div>

      {/* Completion rate bar */}
      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">Completion Rate</span>
          <span className="font-bold text-accent">{completionRate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-2xs text-muted">
          {completedTasks.length} of {tasks.length} total tasks are done.
        </p>
      </section>

      {/* 7-Day Completion Activity */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
          <BarChart size={14} className="text-accent" /> 7-Day Completion Activity
        </div>

        <div className="flex items-end justify-between gap-2 h-32 pt-4">
          {weekData.map((d, i) => {
            const heightPercent = Math.round((d.count / maxDayCount) * 100);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                <span className="text-2xs text-muted font-medium">{d.count}</span>
                <div className="w-full max-w-[36px] bg-elevated rounded-t-lg h-full max-h-[80px] flex items-end overflow-hidden">
                  <div
                    className="w-full bg-accent rounded-t-lg transition-all duration-300"
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                  />
                </div>
                <span className="text-2xs font-semibold text-faint">{d.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two columns: Command Breakdown & Recently Used Apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Command Breakdown */}
        <section className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
            <PieChart size={14} className="text-accent" /> Commands Run ({history.length})
          </div>

          {commandKinds.length === 0 ? (
            <p className="text-xs text-muted">No commands recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {commandKinds.map(([kind, count]) => {
                const percent = Math.round((count / history.length) * 100);
                return (
                  <div key={kind} className="space-y-1">
                    <div className="flex justify-between text-xs text-ink capitalize">
                      <span>{kind}</span>
                      <span className="text-muted">{count} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent/70 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top Apps */}
        <section className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
            <Globe size={14} className="text-accent" /> Recently Launched Apps
          </div>

          {topApps.length === 0 ? (
            <p className="text-xs text-muted">No apps launched yet.</p>
          ) : (
            <div className="space-y-2">
              {topApps.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-elevated/40 p-2.5 text-xs"
                >
                  <span className="font-medium text-ink">{a.name}</span>
                  <span className="text-2xs text-muted capitalize">{a.category}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
