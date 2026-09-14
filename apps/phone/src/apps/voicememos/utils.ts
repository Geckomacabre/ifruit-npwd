import dayjs from 'dayjs';
import { VoiceMemo } from '@typings/voicememos';

export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// Recording timer, with tenths like Apple's: 0:07.4
export const formatElapsed = (ms: number): string =>
  `${formatDuration(ms / 1000)}.${Math.floor(ms / 100) % 10}`;

export const formatMemoDate = (timestamp: number): string => {
  const time = dayjs(timestamp);
  return time.isSame(dayjs(), 'day') ? time.format('h:mm A') : time.format('MMM D, YYYY');
};

export const memoErrorText = (code?: string): string => {
  if (code === 'INVALID_URL') return "That recording host isn't allowed on this server.";
  if (code === 'INVALID_NAME') return 'Give the recording a name.';
  return code || 'Something went wrong with that recording.';
};

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserMemos: VoiceMemo[] = [
  {
    id: 3,
    name: 'Heist plan (do not share)',
    url: 'https://r2.fivemanage.com/memo-3.ogg',
    duration: 94,
    createdAt: Date.now() - 1800e3,
  },
  {
    id: 2,
    name: 'Lester voicemail',
    url: 'https://r2.fivemanage.com/memo-2.ogg',
    duration: 37,
    createdAt: Date.now() - 86400e3,
  },
  {
    id: 1,
    name: 'New Recording',
    url: 'https://r2.fivemanage.com/memo-1.ogg',
    duration: 8,
    createdAt: Date.now() - 4 * 86400e3,
  },
];
