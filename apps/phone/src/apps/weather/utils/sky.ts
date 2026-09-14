import { WeatherCondition } from '@typings/weather';

// The sky is driven by the server's in-game clock, not a day/night boolean, so
// sunrise and sunset actually roll through instead of snapping.

type Rgb = [number, number, number];

interface SkyAnchor {
  at: number;
  top: Rgb;
  bottom: Rgb;
}

const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const css = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

// Keyed to the hour they describe; interpolated between, and wrapping at 24.
const ANCHORS: SkyAnchor[] = [
  { at: 0, top: rgb('#070b1c'), bottom: rgb('#141c39') },
  { at: 4.5, top: rgb('#0d1430'), bottom: rgb('#2a3057') },
  { at: 6, top: rgb('#3d4c80'), bottom: rgb('#cf8e6b') },
  { at: 7.5, top: rgb('#4b86c4'), bottom: rgb('#f2b585') },
  { at: 10, top: rgb('#1c6fd4'), bottom: rgb('#8cc4f2') },
  { at: 14, top: rgb('#1470e0'), bottom: rgb('#93c9f7') },
  { at: 17.5, top: rgb('#2f6ab0'), bottom: rgb('#f0a878') },
  { at: 19.5, top: rgb('#233a72'), bottom: rgb('#c2645f') },
  { at: 21, top: rgb('#101a3c'), bottom: rgb('#2a2b52') },
  { at: 24, top: rgb('#070b1c'), bottom: rgb('#141c39') },
];

/** How grey and flat the weather makes the sky, 0 clear .. 1 total overcast. */
export const OVERCAST: Record<WeatherCondition, number> = {
  clear: 0,
  'partly-cloudy': 0.18,
  cloudy: 0.55,
  fog: 0.62,
  drizzle: 0.55,
  rain: 0.68,
  'heavy-rain': 0.78,
  thunder: 0.82,
  snow: 0.5,
  windy: 0.22,
  storm: 0.88,
};

/** 0 full daylight .. 1 full night, ramped through dawn and dusk. */
export const nightnessAt = (time: number): number => {
  if (time >= 7 && time <= 17.5) return 0;
  if (time > 17.5 && time < 20.5) return (time - 17.5) / 3;
  if (time > 4.5 && time < 7) return 1 - (time - 4.5) / 2.5;
  return 1;
};

export const skyStops = (time: number, overcast: number): { top: string; bottom: string } => {
  const t = ((time % 24) + 24) % 24;

  let lower = ANCHORS[0];
  let upper = ANCHORS[ANCHORS.length - 1];
  for (let i = 0; i < ANCHORS.length - 1; i += 1) {
    if (t >= ANCHORS[i].at && t <= ANCHORS[i + 1].at) {
      lower = ANCHORS[i];
      upper = ANCHORS[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at || 1;
  const k = (t - lower.at) / span;

  const grey: Rgb = mix(rgb('#9aa3b2'), rgb('#1b2029'), nightnessAt(t));
  return {
    top: css(mix(mix(lower.top, upper.top, k), grey, overcast * 0.8)),
    bottom: css(mix(mix(lower.bottom, upper.bottom, k), grey, overcast * 0.8)),
  };
};

const SUNRISE = 6;
const SUNSET = 19;

/** Where the sun or moon sits, as viewport percentages. */
export const celestial = (time: number): { isSun: boolean; x: number; y: number } => {
  const t = ((time % 24) + 24) % 24;
  const isSun = t >= SUNRISE && t < SUNSET;

  const progress = isSun
    ? (t - SUNRISE) / (SUNSET - SUNRISE)
    : ((t < SUNRISE ? t + 24 : t) - SUNSET) / (24 - SUNSET + SUNRISE);

  // Rides the top edge rather than a full horizon-to-horizon arc: the app's
  // location and temperature sit in the middle of the sky, and a sun behind
  // them wrecks both the type and the disc. High noon clips off the top,
  // dawn and dusk sit low and off to the sides where there is nothing.
  return {
    isSun,
    x: 12 + 76 * progress,
    y: 17 - 15 * Math.sin(Math.PI * progress),
  };
};

/** Stable pseudo-random so drops and stars don't jump on every re-render. */
export const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
