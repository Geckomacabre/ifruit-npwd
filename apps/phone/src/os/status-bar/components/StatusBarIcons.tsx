import React from 'react';

// Custom solid-fill status glyphs. The stock lucide icons are thin outline
// strokes (a Material/Android convention) -- iFruit-style status icons are
// small solid shapes instead: filled ascending signal bars, a filled wifi
// arc, and a filled-level battery pill. currentColor so they follow the
// same light/dark text color as the clock.

export const SignalBars: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 18 12" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="8" width="3" height="4" rx="0.75" fill="currentColor" />
    <rect x="5" y="6" width="3" height="6" rx="0.75" fill="currentColor" />
    <rect x="10" y="3" width="3" height="9" rx="0.75" fill="currentColor" />
    <rect x="15" y="0" width="3" height="12" rx="0.75" fill="currentColor" />
  </svg>
);

export const WifiGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 12" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 11.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      fill="currentColor"
    />
    <path
      d="M4.6 7.4a4.9 4.9 0 0 1 6.8 0 .6.6 0 0 1-.83.87 3.7 3.7 0 0 0-5.14 0 .6.6 0 1 1-.83-.87Z"
      fill="currentColor"
    />
    <path
      d="M2 4.6a8.9 8.9 0 0 1 12 0 .6.6 0 1 1-.8.9 7.7 7.7 0 0 0-10.4 0 .6.6 0 1 1-.8-.9Z"
      fill="currentColor"
    />
  </svg>
);

export const BatteryGlyph: React.FC<{ className?: string; level?: number }> = ({
  className,
  level = 1,
}) => {
  const pct = Math.max(0, Math.min(1, level));
  return (
    <svg viewBox="0 0 25 12" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.75"
        y="0.75"
        width="20.5"
        height="10.5"
        rx="2.5"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <rect x="2.5" y="2.5" width={17 * pct} height="7" rx="1.5" fill="currentColor" />
      <rect x="22.5" y="4" width="1.75" height="4" rx="0.875" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
};
