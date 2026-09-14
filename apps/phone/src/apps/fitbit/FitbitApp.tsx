import React, { useCallback, useEffect, useState } from 'react';
import { Droplet, UtensilsCrossed } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { FitbitEvents, FitbitSetResult, FitbitState } from '@typings/fitbit';

const REFRESH_MS = 5000;

const BROWSER_STATE: FitbitState = {
  status: { food: 62, thirst: 38 },
  thresholds: { food: 40, thirst: 40, interval: 5 },
};

interface RingProps {
  value: number;
  label: string;
  colour: string;
  icon: React.ReactNode;
}

// A ring rather than a bar: it reads as a fitness stat at a glance, and the
// number stays legible in the middle at this size.
const Ring: React.FC<RingProps> = ({ value, label, colour, icon }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-neutral-200 dark:stroke-neutral-700" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={colour}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span className="-mt-16 text-xl font-bold">{Math.round(clamped)}%</span>
      <span className="mt-12 flex items-center gap-1.5 text-sm text-neutral-500">
        {icon}
        {label}
      </span>
    </div>
  );
};

export const FitbitApp: React.FC = () => {
  const [state, setState] = useState<FitbitState | null>(null);

  const load = useCallback(async () => {
    const resp = await fetchNui<FitbitState>(FitbitEvents.FETCH, undefined, BROWSER_STATE);
    if (resp) setState(resp);
  }, []);

  useEffect(() => {
    load().catch(console.error);
    const timer = window.setInterval(() => load().catch(console.error), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const setAlert = async (stat: 'food' | 'thirst' | 'interval', value: number) => {
    // Optimistic so the slider tracks the finger; the server snaps food and
    // thirst to steps of 5 and answers with what it actually stored.
    setState((cur) => (cur ? { ...cur, thresholds: { ...cur.thresholds, [stat]: value } } : cur));

    const resp = await fetchNui<FitbitSetResult>(
      FitbitEvents.SET_ALERT,
      { stat, value },
      { ok: true, thresholds: { ...BROWSER_STATE.thresholds, [stat]: value } },
    );

    if (resp?.thresholds) {
      setState((cur) => (cur ? { ...cur, thresholds: resp.thresholds } : cur));
    }
  };

  if (!state) {
    return (
      <AppWrapper id="fitbit-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const { status, thresholds } = state;

  return (
    <AppWrapper id="fitbit-app">
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="px-4 pb-3 pt-2">
          <h1 className="text-3xl font-bold">Fitbit</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Ring
              value={status.food}
              label="Nutrition"
              colour="#f97316"
              icon={<UtensilsCrossed size={14} />}
            />
            <Ring
              value={status.thirst}
              label="Hydration"
              colour="#38bdf8"
              icon={<Droplet size={14} />}
            />
          </div>

          <h2 className="mb-2 text-sm font-semibold text-neutral-500">Alerts</h2>

          {(
            [
              { stat: 'food' as const, label: 'Nutrition', colour: 'accent-orange-500' },
              { stat: 'thirst' as const, label: 'Hydration', colour: 'accent-sky-500' },
            ]
          ).map(({ stat, label, colour }) => (
            <div key={stat} className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{label}</span>
                <span className="text-sm text-neutral-500">
                  {thresholds[stat] > 0 ? `Below ${thresholds[stat]}%` : 'Off'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={thresholds[stat]}
                onChange={(event) => setAlert(stat, Number(event.target.value))}
                className={cn('mt-2 w-full', colour)}
              />
              <p className="text-xs text-neutral-500">Slide to 0 to turn this alert off.</p>
            </div>
          ))}

          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Remind me every</span>
              <span className="text-sm text-neutral-500">
                {thresholds.interval > 0 ? `${thresholds.interval} min` : '2 min'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={thresholds.interval || 2}
              onChange={(event) => setAlert('interval', Number(event.target.value))}
              className="mt-2 w-full accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </AppWrapper>
  );
};
