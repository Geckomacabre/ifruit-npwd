import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { GigEvents } from '@typings/gigs';
import { useGigs } from '../useGigs';

interface Destination {
  ok: boolean;
  message?: string;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
}

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
// Destination comes from the player's own map waypoint rather than an in-app
// map -- the Leaflet picker from the old UI is not ported yet.
export const RiderPanel: React.FC<{ gigs: ReturnType<typeof useGigs> }> = ({ gigs }) => {
  const { addAlert } = useSnackbar();
  const [dest, setDest] = useState<Destination | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [working, setWorking] = useState(false);
  const { state } = gigs;

  if (!state?.riderMode) return null;

  // A driver can't also be a passenger, and vice versa.
  if (state.onDuty || state.job) return null;

  const ride = state.ride;

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

      setDest(point);
      const q = await fetchNui<Quote>(
        GigEvents.QUOTE_RIDE,
        { custom: point },
        { ok: true, fare: 320, distance: 4.2 },
      );
      setQuote(q?.ok ? q : null);
      if (!q?.ok) addAlert({ message: q?.message ?? 'No quote available.', type: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const request = async () => {
    if (!dest) return;
    const res = await gigs.requestRide({ custom: dest });
    if (!res.ok) {
      addAlert({ message: res.message ?? 'Could not request that ride.', type: 'error' });
      return;
    }
    setDest(null);
    setQuote(null);
  };

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
        <button
          type="button"
          disabled={working}
          onClick={useWaypoint}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#14b8a6] py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <MapPin size={15} /> Use my waypoint
        </button>
      )}
    </div>
  );
};
