import React from 'react';
import { cn } from '@utils/css';

// Round Control Center control. `tone` is the lit color it takes when active;
// inactive is always the same dim frosted disc, matching how iOS keeps every
// off-state identical and only colors the on-state.
export type ToggleTone = 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'indigo' | 'white';

const ACTIVE_TONE: Record<ToggleTone, string> = {
  blue: 'bg-[#0a84ff] text-white',
  green: 'bg-[#30d158] text-white',
  orange: 'bg-[#ff9f0a] text-white',
  red: 'bg-[#ff453a] text-white',
  yellow: 'bg-[#ffd60a] text-black',
  indigo: 'bg-[#5e5ce6] text-white',
  white: 'bg-white text-black',
};

interface CircleToggleProps {
  icon: React.ReactNode;
  active?: boolean;
  tone?: ToggleTone;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  /** `glass` for a control that sits on the wallpaper on its own rather than inside a module. */
  variant?: 'plain' | 'glass';
  onClick?: () => void;
}

const SIZE_CLASS = {
  sm: 'h-[32px] w-[32px]',
  md: 'h-[52px] w-[52px]',
  lg: 'h-[62px] w-[62px]',
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
      'flex items-center justify-center rounded-full transition-colors',
      SIZE_CLASS[size],
      active
        ? ACTIVE_TONE[tone]
        : variant === 'glass'
          ? 'liquid-glass text-white'
          : 'bg-white/20 text-white',
    )}
  >
    {icon}
  </button>
);
