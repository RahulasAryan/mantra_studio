import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquare, Settings as SettingsIcon, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAssistant } from '../lib/assistant-context';
import { AvatarAnimation, AvatarShape } from '../types';
import { getStoredAvatarPos, saveStoredAvatarPos } from '../lib/storage';

interface FloatingAvatarProps {
  color?: string;
  shape?: AvatarShape;
  animation?: AvatarAnimation;
  onOpenSettings: () => void;
  onOpenChat: () => void;
}

const AVATAR_SIZE = 64;
const PADDING = 16;

function clampPosition(pos: { x: number; y: number }): { x: number; y: number } {
  const maxX = Math.max(PADDING, window.innerWidth - AVATAR_SIZE - PADDING);
  const maxY = Math.max(PADDING, window.innerHeight - AVATAR_SIZE - PADDING - 40);
  return {
    x: Math.min(maxX, Math.max(PADDING, pos.x)),
    y: Math.min(maxY, Math.max(PADDING, pos.y)),
  };
}

export const FloatingAvatar: React.FC<FloatingAvatarProps> = ({
  color = '#9a84ff',
  shape = 'circle',
  animation = 'normal',
  onOpenSettings,
  onOpenChat,
}) => {
  const {
    state,
    listening,
    transcript,
    startListening,
    stopListening,
    ask,
    setAssistantEnabled,
  } = useAssistant();

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const stored = getStoredAvatarPos();
    if (stored) return clampPosition(stored);
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - AVATAR_SIZE - 24 : 300,
      y: typeof window !== 'undefined' ? window.innerHeight - AVATAR_SIZE - 96 : 400,
    };
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  }>({
    active: false,
    moved: false,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });

  const longPressTimer = useRef<number | undefined>(undefined);
  const didLongPress = useRef(false);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPosition(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
    didLongPress.current = false;

    longPressTimer.current = window.setTimeout(() => {
      longPressTimer.current = undefined;
      if (!dragRef.current.moved) {
        didLongPress.current = true;
        if (navigator.vibrate) navigator.vibrate(15);
        setPanelOpen(false);
        onOpenSettings();
      }
    }, 550);

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dist = Math.hypot(
      e.clientX - dragRef.current.startX,
      e.clientY - dragRef.current.startY
    );
    if (!dragRef.current.moved && dist > 8) {
      dragRef.current.moved = true;
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = undefined;
      }
    }
    if (dragRef.current.moved) {
      setPos(
        clampPosition({
          x: e.clientX - dragRef.current.offsetX,
          y: e.clientY - dragRef.current.offsetY,
        })
      );
    }
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    if (dragRef.current.moved) {
      saveStoredAvatarPos(pos);
      return;
    }
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    setPanelOpen((prev) => !prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    ask(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Draggable Avatar */}
      <div
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className="fixed left-0 top-0 z-50 touch-none select-none"
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <Avatar
            state={state}
            size={AVATAR_SIZE}
            color={color}
            shape={shape}
            animation={animation}
            label="MANTRA Floating Assistant"
          />
        </div>
      </div>

      {/* Quick Assistant Popup Panel */}
      {panelOpen && (
        <div
          style={{
            left: Math.min(Math.max(16, pos.x - 140), window.innerWidth - 340),
            top: pos.y > 320 ? pos.y - 250 : pos.y + AVATAR_SIZE + 12,
          }}
          className="fixed z-50 w-80 rounded-2xl border border-line bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-ink">
                MANTRA Quick Bar
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="text-muted hover:text-ink transition-colors p-1"
            >
              <X size={15} />
            </button>
          </div>

          <div className="my-3">
            {listening ? (
              <p className="text-xs text-accent animate-pulse font-medium">
                Listening... {transcript ? `"${transcript}"` : 'Say a command...'}
              </p>
            ) : (
              <p className="text-xs text-muted">
                Ask anything, run tasks, or open apps.
              </p>
            )}
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['Open YouTube', 'Today tasks', 'Take screenshot', 'Open Spotify'].map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  ask(pill);
                }}
                className="rounded-lg border border-line bg-elevated/70 px-2.5 py-1 text-[11px] text-muted hover:text-ink hover:border-accent/40 transition-colors"
              >
                {pill}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type command..."
              className="flex-1 rounded-xl border border-line bg-elevated px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent"
              autoFocus
            />
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              className={`p-1.5 rounded-xl border transition-colors ${
                listening
                  ? 'border-accent bg-accent/20 text-accent animate-pulse'
                  : 'border-line bg-elevated text-muted hover:text-ink'
              }`}
              title={listening ? 'Stop listening' : 'Start listening'}
            >
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 rounded-xl bg-ink text-black disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              <Send size={14} />
            </button>
          </form>

          <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-2xs text-muted">
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                onOpenChat();
              }}
              className="flex items-center gap-1 hover:text-ink transition-colors"
            >
              <MessageSquare size={12} /> Open Full Chat
            </button>
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-1 hover:text-ink transition-colors"
            >
              <SettingsIcon size={12} /> Settings
            </button>
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false);
                setAssistantEnabled(false);
              }}
              className="hover:text-danger transition-colors"
            >
              Hide Avatar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
