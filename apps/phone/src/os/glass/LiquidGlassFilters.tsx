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

// Mounted once, near the root of the phone. The filters are referenced by id
// from controlCenter.css, so they have to exist in the same document.
export const LiquidGlassFilters: React.FC = () => (
  <svg width="0" height="0" aria-hidden style={{ position: 'absolute', pointerEvents: 'none' }}>
    <defs>
      {/* Big panels: a wide, soft bevel. */}
      <GlassFilter id="lg-panel" inset={0.22} scale={26} blur={2} dispersion={3} />
      {/* Round controls and pills: the bevel has to reach further in
          proportionally, and bend harder, because they are small. */}
      <GlassFilter id="lg-control" inset={0.34} scale={16} blur={1} dispersion={2} />
      {/* The sliders' empty track: strongest bend, no blur, so the wallpaper
          visibly warps through the glass. */}
      <GlassFilter id="lg-track" inset={0.3} scale={22} blur={0.6} dispersion={2.5} />
    </defs>
  </svg>
);
