import { useEffect, useState } from 'react';
import { atom, AtomEffect } from 'recoil';

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
}

export interface StopwatchState {
  startedAt: number | null;
  elapsedBefore: number;
  /** Newest first. */
  laps: number[];
}

export interface TimerState {
  endsAt: number | null;
  /** Time left while paused; 0 when no timer is set. */
  remainingMs: number;
}

// Alarms and world clocks persist like phone settings do: in this player's NUI
// localStorage, so they survive relogs without a database table.
function persisted<T>(key: string): AtomEffect<T> {
  return ({ setSelf, onSet }) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) setSelf(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }

    onSet((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(e);
      }
    });
  };
}

export const alarmsState = atom<Alarm[]>({
  key: 'clock.alarms',
  default: [],
  effects: [persisted<Alarm[]>('npwd-clock-alarms')],
});

export const worldClocksState = atom<string[]>({
  key: 'clock.worldClocks',
  default: ['Los Angeles', 'New York', 'London', 'Tokyo'],
  effects: [persisted<string[]>('npwd-clock-world')],
});

export const stopwatchState = atom<StopwatchState>({
  key: 'clock.stopwatch',
  default: { startedAt: null, elapsedBefore: 0, laps: [] },
});

export const timerState = atom<TimerState>({
  key: 'clock.timer',
  default: { endsAt: null, remainingMs: 0 },
});

export const useNow = (intervalMs: number): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs]);

  return now;
};
