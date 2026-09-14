// Same city list lb-phone's world clock offered.
export const WORLD_CITIES: Record<string, string> = {
  'Los Angeles': 'America/Los_Angeles',
  'New York': 'America/New_York',
  London: 'Europe/London',
  Paris: 'Europe/Paris',
  Stockholm: 'Europe/Stockholm',
  Tokyo: 'Asia/Tokyo',
  Sydney: 'Australia/Sydney',
  'New Delhi': 'Asia/Kolkata',
  'Hong Kong': 'Asia/Hong_Kong',
  'Rio de Janeiro': 'America/Sao_Paulo',
  'Mexico City': 'America/Mexico_City',
  'Cape Town': 'Africa/Johannesburg',
  Hawaii: 'Pacific/Honolulu',
};

export const pad = (value: number): string => String(value).padStart(2, '0');

export const formatClockTime = (hour: number, minute: number) => ({
  time: `${hour % 12 || 12}:${pad(minute)}`,
  period: hour < 12 ? 'AM' : 'PM',
});

export const formatStopwatch = (ms: number): string =>
  `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)}.${pad(Math.floor(ms / 10) % 100)}`;

export const formatCountdown = (ms: number): string => {
  const total = Math.ceil(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};

export const cityTime = (timeZone: string, now: Date) => {
  const there = new Date(now.toLocaleString('en-US', { timeZone }));
  const local = new Date(now.toLocaleString('en-US'));
  const diffHours = Math.round((there.getTime() - local.getTime()) / 3600000);

  let dayLabel = 'Today';
  if (there.getDate() !== local.getDate()) dayLabel = there > local ? 'Tomorrow' : 'Yesterday';

  return { ...formatClockTime(there.getHours(), there.getMinutes()), diffHours, dayLabel };
};
