import React from 'react';
import { Zap } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { GtaMap, GtaMapMarker } from '@os/map/GtaMap';
import { GigEvents, GigNpcRide } from '@typings/gigs';

interface NpcRidePanelProps {
  ride: GigNpcRide;
  brand: string;
  /** Clears the ride from view once it has been rated. */
  onDone: () => void;
}

const PHASE_LABEL: Record<string, string> = {
  dispatched: 'On its way to you',
  arrived: 'Waiting outside',
  boarded: 'On the way to your destination',
  done: 'Arrived',
};

/**
 * The AI-tier ride. Entirely client-side theatre — the car, the driver and
 * this whole panel exist only on the rider's machine, so everything here talks
 * to the local npcRide callbacks rather than the server.
 */
export const NpcRidePanel: React.FC<NpcRidePanelProps> = ({ ride, brand, onDone }) => {
  const markers: GtaMapMarker[] = [];
  if (ride.driverPos) markers.push({ ...ride.driverPos, kind: 'driver' });
  if (ride.pos) markers.push({ ...ride.pos, kind: 'player' });
  if (ride.destPos) markers.push({ ...ride.destPos, kind: 'destination' });

  // Follow the car while it is coming to you, then yourself once aboard --
  // whichever one is the thing actually moving toward something.
  const follow = ride.phase === 'boarded' ? ride.pos : ride.driverPos;

  const rate = async (stars: number) => {
    await fetchNui(GigEvents.NPC_RATE_DRIVER, { stars }, { ok: true });
    onDone();
  };

  return (
    <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
      {markers.length > 0 && <GtaMap className="h-40" follow={follow} markers={markers} />}

      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{PHASE_LABEL[ride.phase] ?? ride.phase}</span>
          {ride.knoway && <span className="text-xs text-neutral-500">{brand}</span>}
        </div>
        {ride.destLabel && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">To {ride.destLabel}</p>
        )}

        {ride.phase === 'done' ? (
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => rate(n)}
                className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-semibold dark:bg-neutral-700"
              >
                {n}★
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={ride.speedBoost}
              onClick={() => fetchNui(GigEvents.NPC_SPEED_UP, undefined, { ok: true })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-neutral-200 py-2 text-sm font-semibold disabled:opacity-50 dark:bg-neutral-700"
            >
              <Zap size={14} />
              {ride.speedBoost ? 'Hurrying' : 'Hurry up'}
            </button>

            {ride.phase === 'boarded' && (
              <button
                type="button"
                onClick={() => fetchNui(GigEvents.NPC_END_RIDE, undefined, { ok: true })}
                className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-semibold text-red-500 dark:bg-neutral-700"
              >
                Let me out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
