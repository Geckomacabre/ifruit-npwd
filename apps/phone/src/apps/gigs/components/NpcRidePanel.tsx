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
    <div className="gig-card overflow-hidden !p-0">
      {markers.length > 0 && <GtaMap className="h-40" follow={follow} markers={markers} />}

      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{PHASE_LABEL[ride.phase] ?? ride.phase}</span>
          {ride.knoway && <span className="gig-pill accent">{brand}</span>}
        </div>
        {ride.destLabel && <p className="mt-1.5 text-[13px]">To {ride.destLabel}</p>}

        {ride.phase === 'done' ? (
          <div className="gig-btn-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => rate(n)} className="gig-btn ghost">
                {n}★
              </button>
            ))}
          </div>
        ) : (
          <div className="gig-btn-row">
            <button
              type="button"
              disabled={ride.speedBoost}
              onClick={() => fetchNui(GigEvents.NPC_SPEED_UP, undefined, { ok: true })}
              className="gig-btn ghost flex items-center justify-center gap-1.5"
            >
              <Zap size={14} />
              {ride.speedBoost ? 'Hurrying' : 'Hurry up'}
            </button>

            {ride.phase === 'boarded' && (
              <button
                type="button"
                onClick={() => fetchNui(GigEvents.NPC_END_RIDE, undefined, { ok: true })}
                className="gig-btn danger"
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
