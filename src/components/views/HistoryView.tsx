import React from 'react';
import { History as HistoryIcon, CheckCircle2, XCircle, Play, Trash2 } from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onClear: () => void;
  onReRun: (cmd: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClear,
  onReRun,
}) => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">
            Command History
          </h1>
          <p className="mt-1 text-xs text-muted">
            {history.length} command{history.length === 1 ? '' : 's'} recorded.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-danger/50 hover:text-danger"
          >
            <Trash2 size={13} /> Clear history
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <HistoryIcon size={32} className="mx-auto mb-3 text-muted/50" />
          <p className="text-sm font-medium text-ink">No commands yet</p>
          <p className="mt-1 text-xs text-muted">
            Commands and actions you execute in chat or via voice appear here.
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {history.map((item) => {
            const date = new Date(item.createdAt);
            const timeStr = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <li key={item.id} className="group transition-colors hover:bg-elevated/40">
                <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.status === 'success' ? (
                      <CheckCircle2 size={16} className="shrink-0 text-success" />
                    ) : (
                      <XCircle size={16} className="shrink-0 text-danger" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">
                        {item.command}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-2xs text-muted">
                        <span>{dateStr} at {timeStr}</span>
                        {item.kind && (
                          <span className="rounded bg-elevated px-1.5 py-0.2 capitalize text-faint">
                            {item.kind}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onReRun(item.command)}
                    title="Run again"
                    className="flex items-center gap-1 rounded-lg border border-line bg-elevated/50 px-2.5 py-1 text-2xs text-muted hover:text-ink hover:border-accent transition-colors"
                  >
                    <Play size={10} /> Rerun
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
