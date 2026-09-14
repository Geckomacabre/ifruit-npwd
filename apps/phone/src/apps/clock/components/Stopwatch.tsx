import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { cn } from '@utils/css';
import { stopwatchState } from '../hooks/state';
import { formatStopwatch } from '../utils';

export const Stopwatch: React.FC = () => {
  const [stopwatch, setStopwatch] = useRecoilState(stopwatchState);
  const [, setFrame] = useState(0);

  const running = stopwatch.startedAt !== null;

  // Re-render every frame only while running; the time itself is derived from
  // startedAt, so leaving the tab and coming back loses nothing.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const tick = () => {
      setFrame((value) => value + 1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const elapsed = stopwatch.elapsedBefore + (running ? Date.now() - stopwatch.startedAt : 0);
  const lapsTotal = stopwatch.laps.reduce((sum, lap) => sum + lap, 0);
  const currentLap = elapsed - lapsTotal;

  const start = () => setStopwatch({ ...stopwatch, startedAt: Date.now() });
  const stop = () => setStopwatch({ ...stopwatch, startedAt: null, elapsedBefore: elapsed });
  const lap = () => setStopwatch({ ...stopwatch, laps: [currentLap, ...stopwatch.laps] });
  const reset = () => setStopwatch({ startedAt: null, elapsedBefore: 0, laps: [] });

  const circle = 'flex h-20 w-20 items-center justify-center rounded-full text-base ring-2 ring-black ring-offset-2';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <p className="py-14 text-center text-7xl font-thin tabular-nums">{formatStopwatch(elapsed)}</p>

      <div className="flex justify-between px-6">
        {running ? (
          <button type="button" onClick={lap} className={cn(circle, 'bg-neutral-800 ring-offset-neutral-800')}>
            Lap
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            disabled={elapsed === 0}
            className={cn(circle, 'bg-neutral-800 ring-offset-neutral-800 disabled:text-neutral-500')}
          >
            Reset
          </button>
        )}
        {running ? (
          <button type="button" onClick={stop} className={cn(circle, 'bg-red-900/60 text-red-400 ring-offset-red-900/60')}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className={cn(circle, 'bg-green-900/60 text-green-400 ring-offset-green-900/60')}
          >
            Start
          </button>
        )}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-4">
        {elapsed > 0 && (
          <div className="flex justify-between border-t border-neutral-800 py-3 tabular-nums">
            <span>Lap {stopwatch.laps.length + 1}</span>
            <span>{formatStopwatch(currentLap)}</span>
          </div>
        )}
        {stopwatch.laps.map((lapMs, index) => (
          <div
            key={stopwatch.laps.length - index}
            className="flex justify-between border-t border-neutral-800 py-3 tabular-nums"
          >
            <span>Lap {stopwatch.laps.length - index}</span>
            <span>{formatStopwatch(lapMs)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
