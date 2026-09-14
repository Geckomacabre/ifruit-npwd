import React from 'react';
import { SvgIconProps } from '@mui/material';
import { LucideIcon } from 'lucide-react';

const TILE_RADIUS = '22%';

// Home-screen artwork from media/icons/appicons. These PNGs already carry
// their own squircle, margin and shadow falloff, so this only adds the floor
// shadow the tile would otherwise be missing.
//
// A few older assets (camera, heart) predate that pack and were exported
// filling their canvas edge-to-edge with no margin at all, so they render
// visibly larger than everything else at the same tile size. `matchMask`
// clips them against squircle-mask.png -- the real pack's own alpha shape,
// lifted directly from one of its PNGs -- via an SVG mask (the same
// technique liquidGlass.tsx uses), not CSS mask-image on a plain <img>,
// which several Chromium builds render unreliably on replaced elements.
export const appIcon = (file: string, options: { matchMask?: boolean } = {}) => {
  const { matchMask = false } = options;

  if (matchMask) {
    const AppMaskedIcon = (props: SvgIconProps) => (
      <svg
        viewBox="0 0 100 100"
        className={props.className}
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.34))', overflow: 'visible' }}
      >
        <defs>
          <mask id={`ai-mask-${file}`} x="0" y="0" width="100" height="100" maskUnits="userSpaceOnUse">
            <image
              href="media/icons/squircle-mask.png"
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="none"
            />
          </mask>
        </defs>
        <image
          href={`media/icons/appicons/${file}.png`}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="none"
          mask={`url(#ai-mask-${file})`}
        />
      </svg>
    );
    return AppMaskedIcon;
  }

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