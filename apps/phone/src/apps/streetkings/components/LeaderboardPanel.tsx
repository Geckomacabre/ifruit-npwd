import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import fetchNuiResource from '@utils/fetchNuiResource';
import { cn } from '@utils/css';
import {
  StreetKingsBoot,
  StreetKingsEvents,
  StreetKingsLeaderboardRow,
  StreetKingsPeriod,
  STREETKINGS_RESOURCE,
} from '@typings/streetkings';
import { BrowserLeaderboard, lapTime, modelName, round } from '../utils';

interface LeaderboardPanelProps {
  boot: StreetKingsBoot;
  /** Highlights the player's own row. */
  charName: string;
}

const PERIODS: { id: StreetKingsPeriod; label: string }[] = [
  { id: 'day', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All time' },
];

const MEDALS = ['text-amber-400', 'text-neutral-400', 'text-amber-700'];

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ boot, charName }) => {
  const [routeId, setRouteId] = useState(boot.routes[0]?.id ?? '');
  const [vehicleClass, setVehicleClass] = useState(boot.classes[0]?.id ?? 7);
  const [period, setPeriod] = useState<StreetKingsPeriod>('all');
  const [rows, setRows] = useState<StreetKingsLeaderboardRow[] | null>(null);

  useEffect(() => {
    if (!routeId) return;

    let live = true;
    setRows(null);

    fetchNuiResource<StreetKingsLeaderboardRow[]>(
      STREETKINGS_RESOURCE,
      StreetKingsEvents.GET_LEADERBOARD,
      { routeId, vehicleClass, period },
      BrowserLeaderboard,
    )
      .then((result) => {
        if (live) setRows(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (live) setRows([]);
      });

    return () => {
      live = false;
    };
  }, [routeId, vehicleClass, period]);

  const route = boot.routes.find((item) => item.id === routeId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-4">
        <select
          value={routeId}
          onChange={(event) => setRouteId(event.target.value)}
          className="w-full rounded-2xl bg-white p-3 text-sm font-semibold outline-none dark:bg-neutral-800"
        >
          {boot.routes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {route && (
          <p className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-neutral-500">
            {round(route.distance, 1)} mi
            {route.laps > 1 && ` · ${route.laps} laps`}
            {route.goalTime && ` · par ${lapTime(route.goalTime)}`}
            {route.gated && (
              <>
                <Lock size={11} /> locked
              </>
            )}
          </p>
        )}

        <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          {boot.classes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVehicleClass(item.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
                vehicleClass === item.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-1">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={cn(
                'flex-1 rounded-full py-1 text-[12px] font-semibold transition-colors',
                period === item.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4 pb-10">
        {rows === null && <LoadingSpinner />}

        {rows?.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">
            No times set on this route yet.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {(rows ?? []).map((row, index) => (
            <div
              key={row.citizenid}
              className={cn(
                'flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800',
                row.alias === charName && 'ring-2 ring-amber-400',
              )}
            >
              <span className={cn('w-6 shrink-0 text-center text-lg font-bold', MEDALS[index])}>
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{row.alias}</span>
                <span className="block truncate text-xs text-neutral-500">
                  {modelName(row.vehicle_model)}
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                {lapTime(row.score_ms)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
