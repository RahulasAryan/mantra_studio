import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Star,
  Plus,
  Trash2,
  Search,
  Globe,
  Clock,
} from 'lucide-react';
import { AppItem } from '../../types';
import { APP_CATEGORIES } from '../../lib/constants';

interface AppsViewProps {
  apps: AppItem[];
  onOpen: (app: AppItem) => void;
  onAdd: (name: string, url: string) => boolean;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const AppsView: React.FC<AppsViewProps> = ({
  apps,
  onOpen,
  onAdd,
  onDelete,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const ok = onAdd(customName.trim() || 'Custom App', customUrl.trim());
    if (!ok) {
      setAddError('Please enter a valid website URL (e.g. https://example.com)');
      return;
    }
    setCustomName('');
    setCustomUrl('');
    setAddError('');
    setFormOpen(false);
  };

  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      const lastA = a.lastUsed || 0;
      const lastB = b.lastUsed || 0;
      if (lastA === lastB) return a.name.localeCompare(b.name);
      return lastB - lastA;
    });
  }, [apps]);

  const recentApps = useMemo(() => {
    return sortedApps.filter((a) => a.lastUsed).slice(0, 6);
  }, [sortedApps]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedApps.filter((a) => {
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.domain.toLowerCase().includes(q) ||
        (a.aliases || []).some((al) => al.toLowerCase().includes(q));
      const matchCat = activeCategory === 'All' || a.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [sortedApps, search, activeCategory]);

  const categories = useMemo(() => {
    const set = new Set(apps.map((a) => a.category));
    return ['All', ...APP_CATEGORIES.filter((c) => set.has(c)), ...[...set].filter((c) => !APP_CATEGORIES.includes(c as any))];
  }, [apps]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">
            Apps & Tools
          </h1>
          <p className="mt-1 text-xs text-muted">
            {apps.length} connected sites. Click to open, or ask in chat ("Open YouTube").
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Add App
        </button>
      </header>

      {/* Add Custom App Form */}
      {formOpen && (
        <form
          onSubmit={handleAddSubmit}
          className="card p-4 space-y-3 border-accent/40 bg-card animate-in fade-in duration-150"
        >
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
            Add custom web app
          </h3>
          {addError && (
            <p className="text-xs text-danger">{addError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="App Name (e.g. My Blog)"
              className="rounded-xl border border-line bg-elevated px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="URL (e.g. https://myblog.com)"
              className="rounded-xl border border-line bg-elevated px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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
              Save App
            </button>
          </div>
        </form>
      )}

      {/* Recently Used Pills */}
      {recentApps.length > 0 && (
        <section className="space-y-2">
          <h2 className="label flex items-center gap-1.5">
            <Clock size={12} /> Recently Used
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onOpen(app)}
                className="flex items-center gap-2 rounded-xl border border-line bg-elevated/70 px-3 py-1.5 text-xs text-ink hover:border-accent hover:bg-elevated transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="font-medium">{app.name}</span>
                <ExternalLink size={11} className="text-muted" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, category, or domain..."
            className="w-full rounded-xl border border-line bg-elevated py-2 pl-9 pr-4 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-ink text-black font-semibold'
                    : 'border border-line bg-elevated/50 text-muted hover:text-ink'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="card group relative flex flex-col justify-between p-4 transition-all hover:border-accent/40 hover:bg-elevated/80"
          >
            <div className="flex items-start justify-between">
              <div
                onClick={() => onOpen(app)}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl bg-elevated text-xs font-bold text-ink border border-line group-hover:border-accent"
              >
                {app.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(app.id)}
                  title={app.favorite ? 'Unstar' : 'Favorite'}
                  className={`p-1 rounded-lg transition-colors ${
                    app.favorite
                      ? 'text-amber-400'
                      : 'text-faint hover:text-amber-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Star size={14} fill={app.favorite ? 'currentColor' : 'none'} />
                </button>
                {app.custom && (
                  <button
                    type="button"
                    onClick={() => onDelete(app.id)}
                    className="p-1 rounded-lg text-faint hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete custom app"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div
              onClick={() => onOpen(app)}
              className="mt-3 cursor-pointer"
            >
              <h3 className="truncate text-xs font-medium text-ink group-hover:text-accent transition-colors">
                {app.name}
              </h3>
              <p className="mt-0.5 truncate text-2xs text-faint">
                {app.domain}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between text-2xs text-muted">
              <span className="capitalize">{app.category}</span>
              <button
                type="button"
                onClick={() => onOpen(app)}
                className="text-muted hover:text-ink flex items-center gap-0.5"
              >
                Open <ExternalLink size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
