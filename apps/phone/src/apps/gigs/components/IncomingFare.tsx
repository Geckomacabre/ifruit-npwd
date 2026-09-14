import React from 'react';
import { cn } from '@utils/css';
import { GigOffer } from '@typings/gigs';

interface IncomingFareProps {
  offer: GigOffer;
  seconds: number;
  accent: string;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

// The card for a fare being pushed at you. The countdown comes from the client
// (see getLive) so it ticks every second without a server round trip.
export const IncomingFare: React.FC<IncomingFareProps> = ({
  offer,
  seconds,
  accent,
  busy,
  onAccept,
  onDecline,
}) => (
  <div className="mb-3 rounded-2xl border-2 border-current/20 bg-white p-4 shadow-sm dark:bg-neutral-800">
    <div className="flex items-baseline justify-between">
      <span className="font-semibold">
        {offer.playerRide ? 'Ride request' : offer.kindLabel}
      </span>
      <span className="text-lg font-bold">${offer.pay}</span>
    </div>

    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
      {offer.playerRide && offer.passengerName
        ? `${offer.passengerName} → ${offer.dropoffLabel}`
        : `${offer.pickupLabel} → ${offer.dropoffLabel}`}
    </p>
    <p className="mt-0.5 text-xs text-neutral-500">
      {offer.distance?.toFixed(1)} km · expires in {seconds}s
    </p>

    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onDecline}
        className="flex-1 rounded-full bg-neutral-200 py-2 text-sm font-semibold disabled:opacity-60 dark:bg-neutral-700"
      >
        Decline
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onAccept}
        className={cn(
          'flex-1 rounded-full py-2 text-sm font-semibold text-white disabled:opacity-60',
          accent,
        )}
      >
        Accept
      </button>
    </div>
  </div>
);
