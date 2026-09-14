import React from 'react';

// Flat silhouettes for the Liquid Glass tiles (see liquidGlass.tsx). All are
// authored in the same 0-100 box, carry no color or lighting of their own, and
// are built from primitives rather than traced artwork -- geometric shapes are
// both closer to how these icons are actually drawn and legible at 60px.

export const PhoneGlyph: React.FC = () => (
  <path d="M30.5 18c-4 0-7.4 2.3-9.6 5.6-2 3-2.6 6.7-1.7 10.2 2.4 9.6 7.7 19.7 15.4 27.4S51.2 74.9 60.8 77.3c3.5.9 7.2.3 10.2-1.7 3.3-2.2 5.6-5.6 5.6-9.6 0-2-1.1-3.8-2.9-4.7l-11-5.6c-2.3-1.2-5.1-.7-6.9 1.2l-3.4 3.6c-.9.9-2.2 1.2-3.3.6-3.3-1.7-6.6-4.1-9.6-7.1s-5.4-6.3-7.1-9.6c-.6-1.1-.3-2.4.6-3.3l3.6-3.4c1.9-1.8 2.4-4.6 1.2-6.9l-5.6-11c-.9-1.8-2.7-2.9-4.7-2.9z" />
);

export const MessagesGlyph: React.FC = () => (
  <path d="M50 17c-18.8 0-34 12.1-34 27 0 8.6 5.1 16.3 13 21.2.2 4.6-1.7 9.2-5.6 13.1-.9.9-.3 2.5 1 2.5 7.7 0 14.4-2.6 19.4-6.2 2 .3 4.1.4 6.2.4 18.8 0 34-12.1 34-27S68.8 17 50 17z" />
);

export const ContactsGlyph: React.FC = () => (
  <>
    <circle cx="50" cy="36" r="14" />
    <path d="M50 54c-13.8 0-25 8.7-25 19.5 0 2.5 2 4.5 4.5 4.5h41c2.5 0 4.5-2 4.5-4.5C75 62.7 63.8 54 50 54z" />
  </>
);

export const CompassGlyph: React.FC = () => (
  <>
    <path d="M50 14c-19.9 0-36 16.1-36 36s16.1 36 36 36 36-16.1 36-36-16.1-36-36-36zm0 8c15.5 0 28 12.5 28 28S65.5 78 50 78 22 65.5 22 50s12.5-28 28-28z" />
    <path d="M67 33 44.5 44.5 33 67l22.5-11.5z" />
  </>
);

export const CameraGlyph: React.FC = () => (
  <>
    <path d="M38 22c-2 0-3.9 1-5 2.7L29.6 30H21c-4.4 0-8 3.6-8 8v30c0 4.4 3.6 8 8 8h58c4.4 0 8-3.6 8-8V38c0-4.4-3.6-8-8-8h-8.6l-3.4-5.3c-1.1-1.7-3-2.7-5-2.7z" />
    <circle cx="50" cy="53" r="15" fill="#000" fillOpacity="0.32" />
  </>
);

export const CalculatorGlyph: React.FC = () => (
  <>
    <rect x="22" y="14" width="56" height="72" rx="9" />
    <rect x="30" y="22" width="40" height="14" rx="4" fill="#000" fillOpacity="0.35" />
    {[0, 1, 2].map((row) =>
      [0, 1, 2, 3].map((col) => (
        <circle
          key={`${row}-${col}`}
          cx={34 + col * 11}
          cy={49 + row * 12}
          r="3.6"
          fill="#000"
          fillOpacity="0.35"
        />
      )),
    )}
  </>
);

export const GearGlyph: React.FC = () => (
  <>
    <path d="M50 12c-2.3 0-4.3 1.6-4.8 3.8l-1.2 5.4c-2.2.7-4.3 1.5-6.2 2.6l-4.7-3c-1.9-1.2-4.4-.9-6 .7l-4.6 4.6c-1.6 1.6-1.9 4.1-.7 6l3 4.7c-1.1 1.9-1.9 4-2.6 6.2l-5.4 1.2C14.6 45.7 13 47.7 13 50s1.6 4.3 3.8 4.8l5.4 1.2c.7 2.2 1.5 4.3 2.6 6.2l-3 4.7c-1.2 1.9-.9 4.4.7 6l4.6 4.6c1.6 1.6 4.1 1.9 6 .7l4.7-3c1.9 1.1 4 1.9 6.2 2.6l1.2 5.4c.5 2.2 2.5 3.8 4.8 3.8s4.3-1.6 4.8-3.8l1.2-5.4c2.2-.7 4.3-1.5 6.2-2.6l4.7 3c1.9 1.2 4.4.9 6-.7l4.6-4.6c1.6-1.6 1.9-4.1.7-6l-3-4.7c1.1-1.9 1.9-4 2.6-6.2l5.4-1.2c2.2-.5 3.8-2.5 3.8-4.8s-1.6-4.3-3.8-4.8l-5.4-1.2c-.7-2.2-1.5-4.3-2.6-6.2l3-4.7c1.2-1.9.9-4.4-.7-6l-4.6-4.6c-1.6-1.6-4.1-1.9-6-.7l-4.7 3c-1.9-1.1-4-1.9-6.2-2.6l-1.2-5.4C54.3 13.6 52.3 12 50 12z" />
    <circle cx="50" cy="50" r="13" fill="#000" fillOpacity="0.35" />
  </>
);

export const ClockGlyph: React.FC = () => (
  <>
    <circle cx="50" cy="50" r="37" />
    <g fill="#15171c">
      <rect x="47.6" y="24" width="4.8" height="28" rx="2.4" />
      <rect x="48" y="47.8" width="23" height="4.4" rx="2.2" />
      <circle cx="50" cy="50" r="3.4" />
    </g>
  </>
);

export const SunCloudGlyph: React.FC = () => (
  <>
    <circle cx="40" cy="34" r="15" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <rect
        key={deg}
        x="38.4"
        y="9"
        width="3.2"
        height="8"
        rx="1.6"
        transform={`rotate(${deg} 40 34)`}
      />
    ))}
    <path d="M43 76c-8.3 0-15-6.7-15-15s6.7-15 15-15c1 0 2 .1 2.9.3C48.7 40.3 54.9 36 62 36c9.9 0 18 8.1 18 18v.6c4.7 1.8 8 6.3 8 11.6 0 6.8-5.5 12.3-12.3 12.3z" />
  </>
);

export const NotesGlyph: React.FC = () => (
  <>
    <rect x="20" y="14" width="60" height="72" rx="9" />
    <rect x="20" y="14" width="60" height="14" rx="7" fill="#000" fillOpacity="0.22" />
    {[42, 54, 66].map((y) => (
      <rect key={y} x="30" y={y} width="40" height="4.6" rx="2.3" fill="#000" fillOpacity="0.3" />
    ))}
  </>
);

export const EnvelopeGlyph: React.FC = () => (
  <>
    <rect x="12" y="24" width="76" height="52" rx="10" />
    <path
      d="M18 32 47 55a5 5 0 0 0 6 0l29-23"
      fill="none"
      stroke="#000"
      strokeOpacity="0.32"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </>
);

export const CarGlyph: React.FC = () => (
  <>
    <path d="M30 32c1.2-3.6 4.6-6 8.4-6h23.2c3.8 0 7.2 2.4 8.4 6l4.6 13.6c3.6 1 6.4 4.3 6.4 8.4v14a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5v-3H34v3a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V54c0-4.1 2.8-7.4 6.4-8.4z" />
    <path d="M34 45 37 34h26l3 11z" fill="#000" fillOpacity="0.3" />
    <circle cx="32" cy="57" r="4.6" fill="#000" fillOpacity="0.3" />
    <circle cx="68" cy="57" r="4.6" fill="#000" fillOpacity="0.3" />
  </>
);

export const BriefcaseGlyph: React.FC = () => (
  <>
    <path d="M40 18h20a9 9 0 0 1 9 9v5h-8v-4a2 2 0 0 0-2-2H41a2 2 0 0 0-2 2v4h-8v-5a9 9 0 0 1 9-9z" />
    <rect x="14" y="32" width="72" height="48" rx="10" />
    <rect x="44" y="50" width="12" height="12" rx="3" fill="#000" fillOpacity="0.3" />
  </>
);

export const WaveformGlyph: React.FC = () => (
  <>
    {[
      [22, 18],
      [32, 34],
      [42, 54],
      [52, 70],
      [62, 44],
      [72, 26],
    ].map(([x, h]) => (
      <rect key={x} x={x - 3} y={50 - h / 2} width="6" height={h} rx="3" />
    ))}
  </>
);

export const BookGlyph: React.FC = () => (
  <>
    <path d="M18 24c0-3.3 2.7-6 6-6h16c5.5 0 10 4.5 10 10v48c0-4.4-3.6-8-8-8H24c-3.3 0-6-2.7-6-6z" />
    <path d="M82 24c0-3.3-2.7-6-6-6H60c-5.5 0-10 4.5-10 10v48c0-4.4 3.6-8 8-8h18c3.3 0 6-2.7 6-6z" />
  </>
);

export const StorefrontGlyph: React.FC = () => (
  <>
    <path d="M22 20h56l7 18a11 11 0 0 1-21 4 11 11 0 0 1-21 0 11 11 0 0 1-21 0z" />
    <path d="M24 46h52v28a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6z" />
    <rect x="42" y="56" width="16" height="24" rx="3" fill="#000" fillOpacity="0.3" />
  </>
);

export const AppGridGlyph: React.FC = () => (
  <>
    {[0, 1].map((row) =>
      [0, 1].map((col) => (
        <rect
          key={`${row}-${col}`}
          x={22 + col * 30}
          y={22 + row * 30}
          width="26"
          height="26"
          rx="8"
        />
      )),
    )}
  </>
);

export const TerminalGlyph: React.FC = () => (
  <>
    <path
      d="m28 34 16 16-16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="52" y="62" width="24" height="8" rx="4" />
  </>
);

export const MegaphoneGlyph: React.FC = () => (
  <>
    <path d="M74 20c0-3-3.4-4.8-5.9-3.1L38 37H26a10 10 0 0 0-10 10v6a10 10 0 0 0 10 10h12l30.1 20.1c2.5 1.7 5.9-.1 5.9-3.1z" />
    <path d="M82 38a14 14 0 0 1 0 24z" />
  </>
);

export const FlameGlyph: React.FC = () => (
  <path d="M52 12c-1.4 12.6-8.6 17.7-14.6 23.7C31.4 41.7 26 48.6 26 60c0 15.5 11.9 28 24 28s24-12.5 24-28c0-9.7-3.6-16.5-8.4-22.6-1 4-3.4 7.2-6.6 9.1 1-13.6-3.4-25.9-7-34.5z" />
);

export const CubeGlyph: React.FC = () => (
  <>
    <path d="M50 14 84 32v36L50 86 16 68V32z" />
    <path d="M50 14 84 32 50 50 16 32z" fill="#fff" fillOpacity="0.28" />
    <path d="M50 50v36L16 68V32z" fill="#000" fillOpacity="0.22" />
  </>
);

export const BagGlyph: React.FC = () => (
  <>
    <path d="M32 30h36a8 8 0 0 1 7.9 6.7l6.5 39A10 10 0 0 1 72.5 87h-45a10 10 0 0 1-9.9-11.3l6.5-39A8 8 0 0 1 32 30z" />
    <path
      d="M38 34V25a12 12 0 0 1 24 0v9"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
    />
  </>
);

export const TaxiGlyph: React.FC = () => (
  <>
    <path d="M28 36c1.3-4 5-6.6 9.2-6.6h25.6c4.2 0 7.9 2.6 9.2 6.6l4.6 13.8c3.7 1.1 6.4 4.5 6.4 8.6v13a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-2H31v2a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-13c0-4.1 2.7-7.5 6.4-8.6z" />
    <path d="M34 49l3.4-11.4h25.2L66 49z" fill="#000" fillOpacity="0.32" />
    <circle cx="32" cy="61" r="4.4" fill="#000" fillOpacity="0.32" />
    <circle cx="68" cy="61" r="4.4" fill="#000" fillOpacity="0.32" />
    <rect x="40" y="14" width="20" height="10" rx="3" />
  </>
);

export const CoinGlyph: React.FC = () => (
  <>
    <circle cx="50" cy="50" r="36" />
    <path
      d="M50 26v48M62 38H44a8 8 0 0 0 0 16h12a8 8 0 0 1 0 16H38"
      fill="none"
      stroke="#000"
      strokeOpacity="0.34"
      strokeWidth="7"
      strokeLinecap="round"
    />
  </>
);

export const CameraLensGlyph: React.FC = () => (
  <>
    <rect x="14" y="14" width="72" height="72" rx="21" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle cx="50" cy="50" r="19" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle cx="70" cy="30" r="5" />
  </>
);

export const NoteGlyph: React.FC = () => (
  <>
    <path d="M44 20h10c1.5 10.5 8.5 17 19 18.5v11C63 48.5 56 45 54 41v24a20 20 0 1 1-20-20c1.4 0 2.7.1 4 .4v11.4A9 9 0 1 0 44 65z" />
  </>
);

export const HouseGlyph: React.FC = () => (
  <>
    <path d="M50 14 12 46h10v34a6 6 0 0 0 6 6h14V60h16v26h14a6 6 0 0 0 6-6V46h10z" />
  </>
);

export const MusicNoteGlyph: React.FC = () => (
  <>
    <path d="M78 16 40 26v39a15 15 0 1 0 8 13V38l22-6v25a15 15 0 1 0 8 13z" />
  </>
);

export const PinGlyph: React.FC = () => (
  <>
    <path d="M50 12c-14.4 0-26 11.6-26 26 0 19.5 26 50 26 50s26-30.5 26-50c0-14.4-11.6-26-26-26z" />
    <circle cx="50" cy="38" r="10" fill="#000" fillOpacity="0.34" />
  </>
);

export const HeartPulseGlyph: React.FC = () => (
  <>
    <path d="M50 84S16 62 16 39a18 18 0 0 1 34-8 18 18 0 0 1 34 8c0 23-34 45-34 45z" />
    <path
      d="M18 46h14l6-11 9 22 7-13h28"
      fill="none"
      stroke="#000"
      strokeOpacity="0.38"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

export const ShieldGlyph: React.FC = () => (
  <>
    <path d="M50 10 18 24v26c0 20 13.5 33.5 32 40 18.5-6.5 32-20 32-40V24z" />
    <path d="M50 32v24" fill="none" stroke="#000" strokeOpacity="0.36" strokeWidth="7" strokeLinecap="round" />
    <circle cx="50" cy="66" r="4.5" fill="#000" fillOpacity="0.36" />
  </>
);

export const LockHeartGlyph: React.FC = () => (
  <>
    <path d="M50 82S20 63 20 42a16 16 0 0 1 30-7 16 16 0 0 1 30 7c0 21-30 40-30 40z" />
    <rect x="38" y="44" width="24" height="19" rx="4" fill="#000" fillOpacity="0.34" />
    <path d="M43 44v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#000" strokeOpacity="0.34" strokeWidth="4" />
  </>
);
