import React, { useRef } from 'react';
import { Check, X, WifiOff } from 'lucide-react';
import { AvatarAnimation, AvatarShape, AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
  size?: number;
  color?: string;
  shape?: AvatarShape;
  animation?: AvatarAnimation;
  onTap?: () => void;
  onLongPress?: () => void;
  label?: string;
  className?: string;
}

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  squircle: 'rounded-[30%]',
  rounded: 'rounded-3xl',
};

const ANIMATION_TIMINGS: Record<AvatarAnimation, { breathe: number; ring: number }> = {
  calm: { breathe: 5, ring: 2.6 },
  normal: { breathe: 3.6, ring: 1.8 },
  lively: { breathe: 2.4, ring: 1.2 },
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(154, 132, 255, ${alpha})`;
}

export const Avatar: React.FC<AvatarProps> = ({
  state,
  size = 132,
  color = '#9a84ff',
  shape = 'circle',
  animation = 'normal',
  onTap,
  onLongPress,
  label = 'MANTRA assistant',
  className = '',
}) => {
  const shapeClass = SHAPE_CLASSES[shape] || SHAPE_CLASSES.circle;
  const timing = ANIMATION_TIMINGS[animation] || ANIMATION_TIMINGS.normal;
  const glowRgba = hexToRgba(color, state === 'idle' ? 0.28 : 0.55);

  const timerRef = useRef<number | undefined>(undefined);
  const didLongPressRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const isClickable = Boolean(onTap || onLongPress);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (didLongPressRef.current) {
          didLongPressRef.current = false;
          return;
        }
        onTap?.();
      }}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        if (!isClickable) return;
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        didLongPressRef.current = false;
        if (onLongPress) {
          timerRef.current = window.setTimeout(() => {
            timerRef.current = undefined;
            didLongPressRef.current = true;
            if (navigator.vibrate) navigator.vibrate(15);
            onLongPress();
          }, 550);
        }
      }}
      onPointerMove={(e) => {
        if (
          Math.hypot(
            e.clientX - pointerStartRef.current.x,
            e.clientY - pointerStartRef.current.y
          ) > 8
        ) {
          clearTimer();
        }
      }}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      className={`relative shrink-0 select-none touch-none transition-transform active:scale-95 ${
        isClickable ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Listening Expanding Rings */}
      {state === 'listening' && (
        <>
          <span
            className={`${shapeClass} avatar-ring absolute inset-0 pointer-events-none`}
            style={{
              border: `2px solid ${hexToRgba(color, 0.5)}`,
              animationDuration: `${timing.ring}s`,
            }}
          />
          <span
            className={`${shapeClass} avatar-ring absolute inset-0 pointer-events-none`}
            style={{
              border: `2px solid ${hexToRgba(color, 0.35)}`,
              animationDuration: `${timing.ring}s`,
              animationDelay: `${timing.ring / 2}s`,
            }}
          />
        </>
      )}

      {/* Thinking Spin Ring */}
      {state === 'thinking' && (
        <span
          className="avatar-spin absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${hexToRgba(
              color,
              0.85
            )} 90deg, transparent 180deg)`,
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))',
          }}
        />
      )}

      {/* Main Avatar Orb */}
      <span
        className={`${shapeClass} absolute inset-[6%] overflow-hidden border border-white/10 ${
          state === 'idle' || state === 'success' ? 'avatar-breathe' : ''
        } ${state === 'error' ? 'avatar-shake' : ''}`}
        style={{
          background: `radial-gradient(circle at 32% 28%, ${hexToRgba(
            color,
            0.95
          )}, ${hexToRgba(color, 0.35)} 55%, rgba(10, 10, 12, 0.95) 100%)`,
          boxShadow: `0 0 34px ${glowRgba}, inset 0 0 24px rgba(0, 0, 0, 0.5)`,
          animationDuration:
            state === 'idle' || state === 'success' ? `${timing.breathe}s` : undefined,
          opacity: state === 'offline' ? 0.45 : 1,
        }}
      >
        {/* Speaking sound-wave bars */}
        {state === 'speaking' && (
          <span className="absolute inset-0 flex items-end justify-center gap-[4px] pb-[28%] pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="avatar-bar w-[7%] rounded-full bg-white/85"
                style={{
                  height: '46%',
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${0.9 - timing.ring * 0.05}s`,
                }}
              />
            ))}
          </span>
        )}

        {/* Success Checkmark */}
        {state === 'success' && (
          <span className="avatar-pop absolute inset-0 flex items-center justify-center">
            <Check className="text-white" size={Math.max(18, size * 0.36)} strokeWidth={3} />
          </span>
        )}

        {/* Error Cross */}
        {state === 'error' && (
          <span className="avatar-pop absolute inset-0 flex items-center justify-center">
            <X className="text-white" size={Math.max(18, size * 0.34)} strokeWidth={3} />
          </span>
        )}

        {/* Offline indicator */}
        {state === 'offline' && (
          <span className="absolute inset-0 flex items-center justify-center text-white/50">
            <WifiOff size={Math.max(16, size * 0.28)} />
          </span>
        )}
      </span>
    </button>
  );
};
