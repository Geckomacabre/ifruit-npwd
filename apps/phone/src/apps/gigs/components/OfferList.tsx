import React from 'react';
import { cn } from '@utils/css';
import { GigOffer } from '@typings/gigs';

interface OfferListProps {
  offers: GigOffer[];
  accent: string;
  busy: boolean;
  empty: string;
  onAccept: (id: number) => void;
}

export const OfferList: React.FC<OfferListProps> = ({ offers, accent, busy, empty, onAccept }) => {
  if (!offers.length) {
    return <p className="py-12 text-center text-sm text-neutral-500">{empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer) => (
        <div key={offer.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">{offer.kindLabel}</span>
            <span className="text-lg font-bold">${offer.pay}</span>
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            {offer.pickupLabel} → {offer.dropoffLabel}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">{offer.distance.toFixed(1)} km</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => onAccept(offer.id)}
            className={cn(
              'mt-3 w-full rounded-full py-2 text-sm font-semibold text-white disabled:opacity-60',
              accent,
            )}
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};
