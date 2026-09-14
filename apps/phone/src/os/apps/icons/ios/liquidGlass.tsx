import React from 'react';
import { SvgIconProps } from '@mui/material';

// Liquid Glass home-screen icons, built rather than shipped as artwork.
//
// The tile is a real superellipse (|x/a|^n + |y/b|^n = 1, n = 5) instead of a
// border-radius: that curve is what makes an iOS icon read as an iOS icon, and
// a rounded rect visibly isn't it at the corners.
//
// Each icon is a flat silhouette over a colored base, with the glass supplied
// by the tile: a top-left specular bloom, a diagonal sheen, a Fresnel rim that
// runs bright at the top edge and dark at the bottom, and a floor shadow.
// The glyph itself never carries lighting -- same split Apple's icon pipeline
// uses, where the designer hands over a silhouette and the system lights it.

const SUPERELLIPSE_N = 5;

const squirclePath = (steps = 160): string => {
  const exp = 2 / SUPERELLIPSE_N;
  const points: string[] = [];

  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const x = 50 + 50 * Math.sign(cos) * Math.abs(cos) ** exp;
    const y = 50 + 50 * Math.sign(sin) * Math.abs(sin) ** exp;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `M${points.join('L')}Z`;
};

const SQUIRCLE = squirclePath();

/** Glyphs are authored in the same 0-100 box and scaled into the safe area. */
const GLYPH_SCALE = 0.56;

// Rather than keep re-deriving the real icon pack's margin/shadow geometry by
// measurement (86.9% alpha bbox, then 80.5% once the shadow's soft falloff
// turned out to be included in that), clip directly against the real shape:
// squircle-mask.png is the alpha channel lifted straight from one of the
// pack's own PNGs. Every icon in that pack shares an identical alpha
// signature (same export template), so this is ground truth, not an
// approximation -- whatever the real margin and corner curvature are, this
// matches them exactly, for the content AND the rim stroke below.
const MASK_URL = 'media/icons/squircle-mask.png';
// The mask's solid core measures 80.5% of its frame; only the decorative rim
// stroke (drawn as vector, not masked) needs told that explicitly.
const TILE_FIT = 0.805;

interface LiquidIconOptions {
  /** Defaults to white; override for tiles whose base is light or needs an accent. */
  glyphColor?: string;
  /** Multiplier on the default glyph size, for glyphs that read small or large. */
  scale?: number;
}

export const liquidIcon = (
  id: string,
  [from, to]: [string, string],
  Glyph: React.FC,
  options: LiquidIconOptions = {},
) => {
  const { glyphColor = '#ffffff', scale = 1 } = options;
  const size = GLYPH_SCALE * scale;

  const LiquidGlassIcon = (props: SvgIconProps) => (
    <svg
      viewBox="0 0 100 100"
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.34))', overflow: 'visible' }}
    >
      <defs>
        <mask id={`lg-mask-${id}`} x="0" y="0" width="100" height="100" maskUnits="userSpaceOnUse">
          <image href={MASK_URL} x="0" y="0" width="100" height="100" preserveAspectRatio="none" />
        </mask>

        <linearGradient id={`lg-base-${id}`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>

        {/* Specular bloom, up and to the left, as if lit from off-screen. */}
        <radialGradient id={`lg-bloom-${id}`} cx="0.3" cy="0.14" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Sheen sweeping across the upper half of the glass. */}
        <linearGradient id={`lg-sheen-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Fresnel rim: light catches the top edge, the bottom edge goes dark. */}
        <linearGradient id={`lg-rim-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id={`lg-floor-${id}`} x1="0" y1="0.5" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <g mask={`url(#lg-mask-${id})`}>
        <rect width="100" height="100" fill={`url(#lg-base-${id})`} />
        <rect width="100" height="100" fill={`url(#lg-floor-${id})`} />
        <rect width="100" height="100" fill={`url(#lg-bloom-${id})`} />
        <rect width="100" height="100" fill={`url(#lg-sheen-${id})`} />

        {/* `color` as well as `fill` so glyphs drawn with strokes can use
            currentColor and still pick up the accent. */}
        <g
          fill={glyphColor}
          color={glyphColor}
          transform={`translate(50 50) scale(${size}) translate(-50 -50)`}
        >
          <Glyph />
        </g>
      </g>

      {/* Decorative Fresnel rim only -- the actual clip comes from the real
          mask above, so this vector squircle only needs to roughly trace its
          edge, scaled to the same measured 80.5% core. */}
      <path
        d={SQUIRCLE}
        fill="none"
        stroke={`url(#lg-rim-${id})`}
        strokeWidth="1.5"
        transform={`translate(50 50) scale(${TILE_FIT}) translate(-50 -50)`}
      />
    </svg>
  );

  return LiquidGlassIcon;
};
