import React, { useEffect, useState } from 'react';
import { Bot, Car, MapPin, X } from 'lucide-react';
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

// The passenger half of rydeme. Picking a tier IS the way into naming a
// destination -- one tap chooses whether a real player or an AI car comes, and
// takes you straight to the map, which is the same two taps a real rideshare
// app asks for.
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

  // You cannot be both halves of the same ride.
  if (state.onDuty || state.job) {
    return (
      <p className="gig-muted py-12 text-center">
        You are driving. Go offline on the Rides tab to book one yourself.
      </p>
    );
  }

  const ride = state.ride;

  /** Prices a resolved point and shows it as the pending destination. */
  const priceIt = async (point: Destination, asNpc: boolean) => {
    setDest(point);
    const q = await fetchNui<Quote>(
      GigEvents.QUOTE_RIDE,
      { custom: point, npc: asNpc },
      { ok: true, fare: asNpc ? 180 : 320, distance: 4.2 },
    );
    setQuote(q?.ok ? q : null);
    if (!q?.ok) addAlert({ message: q?.message ?? 'No quote available.', type: 'error' });
  };

  /**
   * Opens the picker on a tier. Seeded with a waypoint the player already
   * dropped on their own map, if they have one — otherwise blank and centred
   * on them, ready for a tap.
   */
  const choose = async (asNpc: boolean) => {
    setNpc(asNpc);
    setPicking(true);

    const seed = await fetchNui<Destination>(GigEvents.GET_MY_WAYPOINT, undefined, { ok: false });
    if (seed?.ok) {
      setPicking(false);
      await priceIt(seed, asNpc);
      return;
    }

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
      await priceIt(point, npc);
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
      <div className="gig-card">
        <p className="font-semibold">{RIDE_STATE_LABEL[ride.state] ?? ride.state}</p>
        {ride.destLabel && <p className="mt-1 text-[13px]">To {ride.destLabel}</p>}
        {ride.driverName && (
          <p className="gig-muted mt-1">
            {ride.driverName}
            {ride.driverRating ? ` · ${ride.driverRating.toFixed(1)}★` : ''}
            {ride.vehicle ? ` · ${ride.vehicle}` : ''}
          </p>
        )}
        {ride.fare != null && <p className="gig-pay mt-2">${ride.fare}</p>}

        {ride.state === 'done' ? (
          <div className="gig-btn-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => gigs.rateDriver(n)}
                className="gig-btn ghost"
              >
                {n}★
              </button>
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => gigs.cancelRide()} className="gig-btn danger mt-3">
            Cancel ride
          </button>
        )}
      </div>
    );
  }

  // A destination is chosen and priced — all that is left is to commit.
  if (dest) {
    return (
      <div className="gig-card">
        <p className="flex items-center gap-1.5 text-[13px]">
          <MapPin size={14} /> {dest.label}
        </p>
        {quote && (
          <p className="gig-pay mt-1.5">
            ${quote.fare}
            {quote.distance != null && (
              <span className="gig-muted ml-1.5 font-normal">{quote.distance.toFixed(1)} km</span>
            )}
          </p>
        )}
        <p className="gig-muted mt-1">{npc ? config?.npcBrand ?? 'AI pickup' : 'Player pickup'}</p>

        <div className="gig-btn-row">
          <button
            type="button"
            onClick={() => {
              setDest(null);
              setQuote(null);
            }}
            className="gig-btn ghost"
          >
            Change
          </button>
          <button type="button" disabled={gigs.busy} onClick={request} className="gig-btn">
            Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-4 text-center">
        <p className="text-[20px] font-bold">Where to?</p>
        <p className="gig-muted mt-1">
          {state.driversOnline ?? 0} driver{state.driversOnline === 1 ? '' : 's'} online right now
        </p>
      </div>

      <button type="button" className="gig-pick" onClick={() => choose(false)}>
        <span className="gig-pick-icon">
          <Car size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">Player pickup</span>
          <span className="gig-muted block">a real driver comes to you</span>
        </span>
        <span className="gig-pill">COSTS MORE</span>
      </button>

      {config?.npcEnabled && (
        <button type="button" className="gig-pick npc" onClick={() => choose(true)}>
          <span className="gig-pick-icon">
            <Bot size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">AI pickup</span>
            <span className="gig-muted block">a car shows up right now</span>
          </span>
          <span className="gig-pill accent">INSTANT</span>
        </button>
      )}

      <p className="gig-muted mt-4 text-center">Fares are estimates. rydeme keeps a service fee.</p>

      {picking && (
        <div
          className={cn('absolute inset-0 z-30 flex flex-col')}
          style={{ background: 'var(--bg)' }}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <span className="text-[13px] font-semibold">
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
    </>
  );
};
