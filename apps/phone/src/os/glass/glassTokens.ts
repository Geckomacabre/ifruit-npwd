// Liquid Glass tuning. One 0-100 "frost" value drives every glass surface
// (.liquid-glass in Phone.css) through CSS variables on <html>:
//   0   glossy  -- nearly clear, light blur, bright specular edge and sheen
//   100 frosted -- heavy blur, dense tint, soft edges
export const DEFAULT_GLASS_FROST = 55;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const applyGlassTokens = (frost: number): void => {
  const t = Math.max(0, Math.min(100, Number(frost) || 0)) / 100;
  const style = document.documentElement.style;

  style.setProperty('--glass-blur', `${lerp(4, 32, t).toFixed(1)}px`);
  style.setProperty('--glass-saturate', `${lerp(200, 130, t).toFixed(0)}%`);
  style.setProperty('--glass-tint-light', `rgba(255, 255, 255, ${lerp(0.1, 0.62, t).toFixed(3)})`);
  style.setProperty('--glass-tint-dark', `rgba(28, 28, 30, ${lerp(0.18, 0.7, t).toFixed(3)})`);
  style.setProperty('--glass-highlight', lerp(0.75, 0.22, t).toFixed(3));
  style.setProperty('--glass-sheen', lerp(0.38, 0.06, t).toFixed(3));
  style.setProperty('--glass-edge', lerp(0.5, 0.2, t).toFixed(3));
};

export const glassLabel = (frost: number): string => {
  if (frost < 34) return 'Glossy';
  if (frost < 67) return 'Balanced';
  return 'Frosted';
};
