import React from 'react';
import { useBrightness } from '../state';

// Screen dimming for the Control Center brightness slider. A black overlay
// rather than a CSS filter on the phone container: a filter on an ancestor
// creates a containing block and breaks the backdrop-filter every Liquid
// Glass surface relies on. Capped well short of black so the slider is
// always still visible to drag back up.
const MAX_DIM = 0.55;

export const BrightnessOverlay: React.FC = () => {
  const [brightness] = useBrightness();
  if (brightness >= 100) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[80] bg-black"
      style={{ opacity: ((100 - brightness) / 100) * MAX_DIM }}
    />
  );
};
