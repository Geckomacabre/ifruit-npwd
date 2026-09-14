import React from 'react';

// Real refraction for the Liquid Glass surfaces.
//
// Blur and a white tint only ever produce frosted plastic. What makes glass
// read as glass is that it BENDS what is behind it, so these filters drive a
// feDisplacementMap from a generated bevel map and hang it off
// `backdrop-filter: url(#...)`, which Chromium (and so CEF/NUI) supports.
//
// The map encodes the horizontal shift in red and the vertical shift in green,
// where 0.5 grey means "no shift". It stays flat through the middle and ramps
// hard only inside the rim, which is what gives a thick-edged lens rather than
// a uniform magnifier: content near the edge gets pulled inward and the centre
// stays honest.
//
// feDisplacementMap samples as pos + scale * (channel - 0.5), so red runs
// 1 -> 0.5 -> 0 left to right, and green does the same top to bottom.
const bevelMap = (inset: number) => {
  const a = inset;
  const b = 1 - inset;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ff0000"/>
      <stop offset="${a}" stop-color="#800000"/>
      <stop offset="${b}" stop-color="#800000"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#00ff00"/>
      <stop offset="${a}" stop-color="#008000"/>
      <stop offset="${b}" stop-color="#008000"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="#000"/>
  <rect width="100" height="100" fill="url(#h)" style="mix-blend-mode:screen"/>
  <rect width="100" height="100" fill="url(#v)" style="mix-blend-mode:screen"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

interface GlassFilterProps {
  id: string;
  /** How far in from the edge the bevel reaches, 0-0.5 of the element. */
  inset: number;
  /** Displacement strength in px. */
  scale: number;
  blur: number;
  /** RGB split, in px of extra displacement on the red and blue channels. */
  dispersion?: number;
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

// One shape's scale/dispersion/blur across the 0 (glossy) - 1 (frosted) frost
// range. Glossy glass bends light sharply and splits it cleanly at the edge;
// frosted glass diffuses both away as part of the same physical process that
// thickens the blur -- so all three move together off the Settings slider,
// not just blur.
interface FrostRange {
  scale: [number, number];
  dispersion: [number, number];
  blur: [number, number];
}

const at = (range: FrostRange, t: number) => ({
  scale: lerp(range.scale[0], range.scale[1], t),
  dispersion: lerp(range.dispersion[0], range.dispersion[1], t),
  blur: lerp(range.blur[0], range.blur[1], t),
});

const GlassFilter: React.FC<GlassFilterProps> = ({ id, inset, scale, blur, dispersion = 0 }) => (
  <filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feImage href={bevelMap(inset)} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

    {dispersion > 0 ? (
      <>
        {/* Each channel refracts by a slightly different amount, the way real
            glass splits light at a steep edge. */}
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale + dispersion} xChannelSelector="R" yChannelSelector="G" result="rch" />
        <feColorMatrix in="rch" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="gch" />
        <feColorMatrix in="gch" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale - dispersion} xChannelSelector="R" yChannelSelector="G" result="bch" />
        <feColorMatrix in="bch" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" result="refracted" />
      </>
    ) : (
      <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="refracted" />
    )}

    <feGaussianBlur in="refracted" stdDeviation={blur} />
  </filter>
);

// Big panels: a wide, soft bevel.
const PANEL: FrostRange = { scale: [32, 20], dispersion: [4, 1], blur: [1, 4] };
// Round controls and pills: the bevel has to reach further in proportionally,
// and bend harder, because they are small.
const CONTROL: FrostRange = { scale: [20, 12], dispersion: [3, 0.5], blur: [0.5, 2] };
// The sliders' empty track: strongest bend, so the wallpaper visibly warps
// through the glass even when the rest of the phone has frosted over.
const TRACK: FrostRange = { scale: [28, 16], dispersion: [3.5, 0.8], blur: [0.3, 1.5] };

interface LiquidGlassFiltersProps {
  /** 0 (glossy) - 100 (frosted), from the Settings > Liquid Glass slider. */
  frost?: number;
}

// Mounted once, near the root of the phone. The filters are referenced by id
// from controlCenter.css, so they have to exist in the same document. Kept
// reactive to `frost` so the bend and chromatic split -- not just blur/tint --
// respond to the slider, the same physical change happening at every scale.
export const LiquidGlassFilters: React.FC<LiquidGlassFiltersProps> = ({ frost = 0 }) => {
  const t = Math.max(0, Math.min(100, frost)) / 100;
  const panel = at(PANEL, t);
  const control = at(CONTROL, t);
  const track = at(TRACK, t);

  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <GlassFilter id="lg-panel" inset={0.22} {...panel} />
        <GlassFilter id="lg-control" inset={0.34} {...control} />
        <GlassFilter id="lg-track" inset={0.3} {...track} />
      </defs>
    </svg>
  );
};
