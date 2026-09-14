import React from 'react';
import { SvgIconProps } from '@mui/material';
import { LucideIcon } from 'lucide-react';

const TILE_RADIUS = '22%';

// Glyph on a gradient tile. The iOS icon set itself now builds its home-screen
// tiles in liquidGlass.tsx; this is what the other icon sets still use.
export const iosGlyphTile = (Glyph: LucideIcon, from: string, to: string) => {
  const IosGlyphTile = (props: SvgIconProps) => (
    <div
      className={props.className}
      style={{
        borderRadius: TILE_RADIUS,
        background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}
    >
      <Glyph size={34} strokeWidth={2.2} />
    </div>
  );
  return IosGlyphTile;
};

// Small monochrome glyph used inside notifications.
export const iosNotificationGlyph = (Glyph: LucideIcon) => {
  const IosNotificationGlyph = (props: SvgIconProps) => (
    <Glyph size={16} color={props.htmlColor ?? 'currentColor'} />
  );
  return IosNotificationGlyph;
};