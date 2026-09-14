import React from 'react';
import { cn } from '@utils/css';

// Round Control Center control. `tone` is the lit color it takes when active;
// off-states are all identical, the way iOS only ever colors the on-state.
// Lit colors are the iOS system palette so they read as the real thing.
export type ToggleTone = 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'white';

const ACTIVE_TONE: Record<ToggleTone, string> = {
  blue: 'bg-gradient-to-b from-[#3d9bff] to-[#007aff] text-white',
  green: 'bg-gradient-to-b from-[#4ade80] to-[#30d158] text-white',
  red: 'bg-gradient-to-b from-[#ff6b60] to-[#ff3b30] text-white',
  yellow: 'bg-gradient-to-b from-[#ffe14d] to-[#ffd60a] text-black',
  indigo: 'bg-gradient-to-b from-[#7d7bff] to-[#5e5ce6] text-white',
  white: 'bg-white text-black',
};

interface CircleToggleProps {
  icon: React.ReactNode;
  active?: boolean;
  tone?: ToggleTone;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** `glass` for a control that stands on the wallpaper rather than inside a module. */
  variant?: 'plain' | 'glass';
  onClick?: () => void;
}

const SIZE_CLASS = {
  sm: 'h-[32px] w-[32px]',
  md: 'h-[66px] w-[66px]',
  lg: 'h-[68px] w-[68px]',
};

export const CircleToggle: React.FC<CircleToggleProps> = ({
  icon,
  active = false,
  tone = 'blue',
  label,
  size = 'md',
  variant = 'plain',
  onClick,
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center rounded-full transition-colors cc-circle-press',
      SIZE_CLASS[size],
      active
        ? cn('cc-circle-on', ACTIVE_TONE[tone])
        : cn('text-white', variant === 'glass' ? 'cc-circle-glass' : 'cc-circle-off'),
    )}
  >
    {icon}
  </button>
);
