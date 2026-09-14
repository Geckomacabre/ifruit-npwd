import React, { useEffect, useState } from 'react';
import { Map as MapIcon, MapPin, X } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { GtaMap } from '@os/map/GtaMap';
import { cn } from '@utils/css';
import { GigEvents, GigPoint, GigRiderConfig } from '@typings/gigs';
import { useGigs } from '../useGigs';
import { NpcRidePanel } from './NpcRidePanel';

type Destination = GigPoint;

interface Quote {
  ok: boolean;
  fare?: number;
  distance?: number;
  message?: string;
}

const RIDE_STATE_LABEL: Record<string, string> = {
  searching: 'Finding you a driver…',
  assigned: 'Driver on the way',
  onboard: 'On the way to your destination',
  done: 'Arrived',
};

// The passenger half of rydeme: pick a destination, get a quote, request it.
// Two ways in -- tap the in-app map, or reuse a waypoint already dropped on
// the player's own map. Both land on the same resolved point and the same
// quote, so they behave identically from there on.
export const RiderPanel: React.FC<{ gigs: ReturnType<typeof useGigs> }> = ({ gigs }) => {
  const { addAlert } = useSnackbar();
  const [dest, setDest] = useState<Destination | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [working, setWorking] = useState(false);
  const [picking, setPicking] = useState(false);
  const [me, setMe] = useState<{ x: number; y: number } | null>(null);
  const [config, setConfig] = useState<GigRiderConfig | null>(null);
  // Which tier the next request books: a real player, or an AI car.
  const [npc, setNpc] = useState(false);
  const { state } = gigs;

  useEffect(() => {
    fetchNui<GigRiderConfig>(GigEvents.GET_RIDER_CONFIG, undefined, {
      ok: true,
      npcEnabled: true,
      npcBrand: 'KnoWay',
    })
      .then(setConfig)
      .catch(console.error);
  }, []);

  if (!state?.riderMode) return null;

  // A driver can't also be a passenger, and vice versa.
  if (state.onDuty || state.job) return null;

  const ride = state.ride;

  /** Prices a resolved point and shows it as the pending destination. */
  const priceIt = async (point: Destination) => {
    setDest(point);
    const q = await fetchNui<Quote>(
      GigEvents.QUOTE_RIDE,
      { custom: point, npc },
      { ok: true, fare: npc ? 180 : 320, distance: 4.2 },
    );
    setQuote(q?.ok ? q : null);
    if (!q?.ok) addAlert({ message: q?.message ?? 'No quote available.', type: 'error' });
  };

  const useWaypoint = async () => {
    setWorking(true);
    try {
      const point = await fetchNui<Destination>(GigEvents.GET_MY_WAYPOINT, undefined, {
        ok: true,
        label: 'Vespucci Beach',
        x: -1223,
        y: -1500,
        z: 4,
      });

      if (!point?.ok) {
        addAlert({ message: point?.message ?? 'No waypoint set.', type: 'error' });
        return;
      }
      await priceIt(point);
    } finally {
      setWorking(false);
    }
  };

  const openPicker = async () => {
    setPicking(true);
    // Centre on the player, so the first thing on screen is where they are.
    const here = await fetchNui<Destination>(GigEvents.GET_MY_COORDS, undefined, {
      ok: true,
      x: -1037,
      y: -2737,
      z: 20,
    });
    if (here?.ok && here.x != null && here.y != null) setMe({ x: here.x, y: here.y });
  };

  /**
   * A tap on the map. The point is resolved client-side (ground height, road
   * snap, street name) before it is priced, so a pin dropped in the middle of
   * a block still becomes somewhere a car can actually stop.
   */
  const pickOnMap = async (world: { x: number; y: number }) => {
    setWorking(true);
    try {
      const point = await fetchNui<Destination>(
        GigEvents.RESOLVE_MAP_POINT,
        { x: world.x, y: world.y },
        { ok: true, label: 'Alta Street', x: world.x, y: world.y, z: 30 },
      );

      if (!point?.ok) {
        addAlert({ message: point?.message ?? 'Could not use that spot.', type: 'error' });
        return;
      }
      await priceIt(point);
      setPicking(false);
    } finally {
      setWorking(false);
    }
  };

  const request = async () => {
    if (!dest) return;
    const res = await gigs.requestRide({ custom: dest, npc });
    if (!res.ok) {
      addAlert({ message: res.message ?? 'Could not request that ride.', type: 'error' });
      return;
    }
    setDest(null);
    setQuote(null);
  };

  // An AI ride is bought outright rather than booked, so it never becomes a
  // `ride` -- it lives entirely on this client and has its own panel.
  if (state.npcRide) {
    return (
      <NpcRidePanel
        ride={state.npcRide}
        brand={config?.npcBrand ?? 'KnoWay'}
        onDone={() => gigs.reload()}
      />
    );
  }

  if (ride) {
    return (
      <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
        <p className="font-semibold">{RIDE_STATE_LABEL[ride.state] ?? ride.state}</p>
        {ride.destLabel && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">To {ride.destLabel}</p>
        )}
        {ride.driverName && (
          <p className="mt-0.5 text-xs text-neutral-500">
            {ride.driverName}
            {ride.driverRating ? ` · ${ride.driverRating.toFixed(1)}★` : ''}
            {ride.vehicle ? ` · ${ride.vehicle}` : ''}
          </p>
        )}
        {ride.fare != null && <p className="mt-2 text-lg font-bold">${ride.fare}</p>}

        {ride.state === 'done' ? (
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => gigs.rateDriver(n)}
                className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-semibold dark:bg-neutral-700"
              >
                {n}★
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => gigs.cancelRide()}
            className="mt-3 w-full rounded-full bg-neutral-200 py-2 text-sm font-semibold text-red-500 dark:bg-neutral-700"
          >
            Cancel ride
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Get a ride</span>
        <span className="text-xs text-neutral-500">
          {state.driversOnline ?? 0} driver{state.driversOnline === 1 ? '' : 's'} online
        </span>
      </div>

      {dest ? (
        <>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300">
            <MapPin size={14} /> {dest.label}
          </p>
          {quote && (
            <p className="mt-1 text-lg font-bold">
              ${quote.fare}
              {quote.distance != null && (
                <span className="ml-1 text-xs font-normal text-neutral-500">
                  {quote.distance.toFixed(1)} km
                </span>
              )}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDest(null);
                setQuote(null);
              }}
              className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-semibold dark:bg-neutral-700"
            >
              Change
            </button>
            <button
              type="button"
              disabled={gigs.busy}
              onClick={request}
              className="flex-1 rounded-full bg-[#14b8a6] py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Request
            </button>
          </div>
        </>
      ) : (
        <>
          {config?.npcEnabled && (
            // Two tiers: a real player driving, or an AI car. Priced on
            // separate bands, so the choice has to come before the quote.
            <div className="mt-2 flex gap-1">
              {[
                { npc: false, label: 'Player driver' },
                { npc: true, label: config.npcBrand ?? 'AI ride' },
              ].map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setNpc(tier.npc)}
                  className={cn(
                    'flex-1 rounded-full py-1 text-[12px] font-semibold transition-colors',
                    npc === tier.npc
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={working}
              onClick={openPicker}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#14b8a6] py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <MapIcon size={15} /> Pick on map
            </button>
            <button
              type="button"
              disabled={working}
              onClick={useWaypoint}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-200 py-2 text-sm font-semibold disabled:opacity-60 dark:bg-neutral-700"
            >
              <MapPin size={15} /> Waypoint
            </button>
          </div>
        </>
      )}

      {picking && (
        <div className="absolute inset-0 z-30 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 pb-2 pt-3 text-white">
            <span className="text-sm font-semibold">
              {working ? 'Finding that spot…' : 'Tap where you want to go'}
            </span>
            <button
              type="button"
              aria-label="Close map"
              onClick={() => setPicking(false)}
              className="rounded-full bg-white/15 p-1.5"
            >
              <X size={16} />
            </button>
          </div>

          <GtaMap
            className="flex-1"
            center={me ?? undefined}
            markers={me ? [{ ...me, kind: 'player' }] : []}
            onPick={working ? undefined : pickOnMap}
          />
        </div>
      )}
    </div>
  );
};
