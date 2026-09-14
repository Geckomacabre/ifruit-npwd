import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { cn } from '@utils/css';
import { timerState, useNow } from '../hooks/state';
import { formatCountdown } from '../utils';

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

const Picker: React.FC<{ value: number; max: number; label: string; onChange: (value: number) => void }> = ({
  value,
  max,
  label,
  onChange,
}) => (
  <label className="flex flex-1 items-center justify-center gap-2">
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="rounded-lg bg-neutral-800 px-2 py-3 text-3xl tabular-nums text-white outline-none"
    >
      {range(max).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <span className="text-sm text-neutral-400">{label}</span>
  </label>
);

export const TimerView: React.FC = () => {
  const [timer, setTimer] = useRecoilState(timerState);
  const [picked, setPicked] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const now = useNow(250);

  const running = timer.endsAt !== null;
  const paused = !running && timer.remainingMs > 0;
  const remaining = running ? Math.max(0, timer.endsAt - now.getTime()) : timer.remainingMs;
  const pickedMs = ((picked.hours * 60 + picked.minutes) * 60 + picked.seconds) * 1000;

  // The clock service (useClockService) rings when endsAt passes, even with the app closed.
  const start = () => setTimer({ endsAt: Date.now() + (paused ? timer.remainingMs : pickedMs), remainingMs: 0 });
  const pause = () => setTimer({ endsAt: null, remainingMs: remaining });
  const cancel = () => setTimer({ endsAt: null, remainingMs: 0 });

  const circle = 'flex h-20 w-20 items-center justify-center rounded-full text-base';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {running || paused ? (
        <p className="py-14 text-center text-7xl font-thin tabular-nums">{formatCountdown(remaining)}</p>
      ) : (
        <div className="flex gap-1 px-2 py-12">
          <Picker value={picked.hours} max={24} label="hours" onChange={(hours) => setPicked({ ...picked, hours })} />
          <Picker value={picked.minutes} max={60} label="min" onChange={(minutes) => setPicked({ ...picked, minutes })} />
          <Picker value={picked.seconds} max={60} label="sec" onChange={(seconds) => setPicked({ ...picked, seconds })} />
        </div>
      )}

      <div className="flex justify-between px-6">
        <button
          type="button"
          onClick={cancel}
          disabled={!running && !paused}
          className={cn(circle, 'bg-neutral-800 disabled:text-neutral-500')}
        >
          Cancel
        </button>
        {running ? (
          <button type="button" onClick={pause} className={cn(circle, 'bg-orange-900/60 text-orange-400')}>
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={!paused && pickedMs === 0}
            className={cn(circle, 'bg-green-900/60 text-green-400 disabled:opacity-40')}
          >
            {paused ? 'Resume' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
};
