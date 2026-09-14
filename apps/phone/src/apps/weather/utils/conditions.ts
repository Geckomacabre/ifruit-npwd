import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  LucideIcon,
  Moon,
  Sun,
  Tornado,
  Wind,
} from 'lucide-react';
import { WeatherCondition, WeatherData } from '@typings/weather';

interface ConditionLook {
  label: string;
  day: LucideIcon;
  night: LucideIcon;
  dayGradient: [string, string];
  nightGradient: [string, string];
}

const NIGHT: [string, string] = ['#0f172a', '#1e293b'];
const GREY_DAY: [string, string] = ['#64748b', '#334155'];
const GREY_NIGHT: [string, string] = ['#1e293b', '#0f172a'];

export const CONDITIONS: Record<WeatherCondition, ConditionLook> = {
  clear: { label: 'Clear', day: Sun, night: Moon, dayGradient: ['#3b82f6', '#60a5fa'], nightGradient: NIGHT },
  'partly-cloudy': {
    label: 'Mostly Clear',
    day: CloudSun,
    night: CloudMoon,
    dayGradient: ['#4f8ad9', '#8fb3dc'],
    nightGradient: NIGHT,
  },
  cloudy: { label: 'Cloudy', day: Cloud, night: Cloud, dayGradient: GREY_DAY, nightGradient: GREY_NIGHT },
  fog: { label: 'Fog', day: CloudFog, night: CloudFog, dayGradient: ['#94a3b8', '#64748b'], nightGradient: GREY_NIGHT },
  drizzle: { label: 'Light Rain', day: CloudDrizzle, night: CloudDrizzle, dayGradient: GREY_DAY, nightGradient: GREY_NIGHT },
  rain: { label: 'Rain', day: CloudRain, night: CloudRain, dayGradient: ['#475569', '#1e293b'], nightGradient: GREY_NIGHT },
  'heavy-rain': {
    label: 'Heavy Rain',
    day: CloudRain,
    night: CloudRain,
    dayGradient: ['#334155', '#0f172a'],
    nightGradient: GREY_NIGHT,
  },
  thunder: {
    label: 'Thunder',
    day: CloudLightning,
    night: CloudLightning,
    dayGradient: ['#374151', '#111827'],
    nightGradient: ['#111827', '#030712'],
  },
  snow: { label: 'Snow', day: CloudSnow, night: CloudSnow, dayGradient: ['#93c5fd', '#cbd5e1'], nightGradient: GREY_NIGHT },
  windy: { label: 'Windy', day: Wind, night: Wind, dayGradient: ['#60a5fa', '#94a3b8'], nightGradient: NIGHT },
  storm: { label: 'Stormy', day: Tornado, night: Tornado, dayGradient: ['#4c1d95', '#1e1b4b'], nightGradient: ['#1e1b4b', '#020617'] },
};

export const lookFor = (condition: WeatherCondition): ConditionLook => CONDITIONS[condition] ?? CONDITIONS.clear;

export const formatHour = (hour: number): string => `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;

export const feelsLikeText = (weather: WeatherData): string => {
  if (weather.feelsLike < weather.temperature) return 'Wind is making it feel cooler.';
  if (weather.feelsLike > weather.temperature) return 'Humidity is making it feel warmer.';
  return 'Similar to the actual temperature.';
};

// The line under H/L. Built only from what the server actually reports --
// no invented forecast.
export const summaryText = (weather: WeatherData): string => {
  const label = lookFor(weather.condition).label;
  const minutes = weather.nextChangeMinutes;

  if (minutes === null) return `${label} conditions, holding steady for now.`;
  if (minutes < 1) return `${label} conditions, changing any minute now.`;
  if (minutes < 60) return `${label} conditions for the next ${minutes} min.`;

  const hours = Math.floor(minutes / 60);
  return `${label} conditions, changing in about ${hours} hr${hours === 1 ? '' : 's'}.`;
};

export const formatChange = (minutes: number | null): string => {
  if (minutes === null) return 'Holding steady for now.';
  if (minutes < 1) return 'Changing any minute.';
  if (minutes < 60) return `Expected to change in ${minutes} min.`;
  const hours = Math.floor(minutes / 60);
  return `Expected to change in about ${hours} hr${hours === 1 ? '' : 's'}.`;
};

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserWeather: WeatherData = {
  city: 'Vespucci Beach',
  weatherType: 'EXTRASUNNY',
  condition: 'clear',
  isNight: false,
  temperature: 104,
  feelsLike: 104,
  high: 110,
  low: 90,
  windMph: 6,
  windDirection: 'SW',
  rainLevel: 0,
  nextChangeMinutes: 42,
  hourly: [14, 15, 16, 17, 18, 19].map((hour) => ({
    hour,
    temperature: 100 + Math.round(Math.cos(((hour - 15) / 24) * 2 * Math.PI) * 10),
    isNight: false,
  })),
};
