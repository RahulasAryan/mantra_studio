import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  userName?: string;
}

const NAV_ITEMS: Array<{ label: string; view: AppView }> = [
  { label: 'Home', view: 'home' },
  { label: 'Chat', view: 'chat' },
  { label: 'Tasks', view: 'tasks' },
  { label: 'Apps', view: 'apps' },
  { label: 'History', view: 'history' },
  { label: 'Insights', view: 'insights' },
  { label: 'Settings', view: 'settings' },
];

export const Navigation: React.FC<NavigationProps> = ({
  view,
  onNavigate,
  onLogout,
  userName = 'Local User',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleSelect = (v: AppView) => {
    onNavigate(v);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-line bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleSelect('home')}
            aria-label="Go to home"
            className="flex items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-elevated text-xs font-semibold text-accent">
              ✳︎
            </span>
            <span className="text-sm font-bold tracking-[0.2em] text-ink">
              MANTRA
            </span>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleSelect(item.view)}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-elevated text-ink'
                      : 'text-muted hover:text-ink hover:bg-elevated/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right actions: User & Logout / Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-muted">
                {userName.slice(0, 14)}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-elevated/60 text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                <LogOut size={14} />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-elevated text-ink md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-xl md:hidden animate-in fade-in duration-200">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-elevated text-xs font-semibold text-accent">
                ✳︎
              </span>
              <span className="text-sm font-bold tracking-[0.2em] text-ink">
                MANTRA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-elevated text-ink"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => handleSelect(item.view)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-elevated text-ink font-semibold'
                      : 'text-muted hover:text-ink hover:bg-elevated/40'
                  }`}
                >
                  {item.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-line p-4">
            <div className="flex items-center justify-between mb-3 text-xs text-muted">
              <span>Signed in as</span>
              <span className="font-medium text-ink">{userName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 py-2.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
};
