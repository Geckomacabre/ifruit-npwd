import React from 'react';
import { SvgIconProps } from '@mui/material';
import { LucideIcon } from 'lucide-react';

const TILE_RADIUS = '22%';

// Home-screen icon from the iOS 18 set (media/icons/ios18, MIT, SysAdminDoc/iOSIconPack).
export const iosImageIcon = (file: string) => {
  const IosImageIcon = (props: SvgIconProps) => (
    <img
      src={`media/icons/ios18/${file}.png`}
      alt=""
      draggable={false}
      className={props.className}
      style={{ borderRadius: TILE_RADIUS, objectFit: 'cover' }}
    />
  );
  return IosImageIcon;
};

// For apps the pack has no artwork for: a glyph on an iOS-style gradient tile.
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