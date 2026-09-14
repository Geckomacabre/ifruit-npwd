import React from 'react';
import { SvgIconProps } from '@mui/material';
import { LucideIcon } from 'lucide-react';

const TILE_RADIUS = '22%';

// Home-screen artwork from media/icons/appicons. The PNGs already carry their
// own squircle and transparent corners, so this only adds the floor shadow the
// tile would otherwise be missing. Apps with no artwork fall back to a
// generated Liquid Glass tile (liquidGlass.tsx).
export const appIcon = (file: string) => {
  const AppImageIcon = (props: SvgIconProps) => (
    <img
      src={`media/icons/appicons/${file}.png`}
      alt=""
      draggable={false}
      className={props.className}
      style={{ filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.34))' }}
    />
  );
  return AppImageIcon;
};

// Glyph on a gradient tile, used by the other icon sets.
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