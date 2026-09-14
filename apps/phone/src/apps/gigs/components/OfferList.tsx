import React from 'react';
import { GigOffer } from '@typings/gigs';

interface OfferListProps {
  offers: GigOffer[];
  busy: boolean;
  empty: string;
  onAccept: (id: number) => void;
}

export const OfferList: React.FC<OfferListProps> = ({ offers, busy, empty, onAccept }) => {
  if (!offers.length) {
    return <p className="gig-muted py-12 text-center">{empty}</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {offers.map((offer) => (
        <div key={offer.id} className="gig-card">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">{offer.kindLabel}</span>
            <span className="gig-pay">${offer.pay}</span>
          </div>
          <p className="mt-1.5 text-[13px]">
            {offer.pickupLabel} → {offer.dropoffLabel}
          </p>
          <p className="gig-muted mt-1">{offer.distance.toFixed(1)} km</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => onAccept(offer.id)}
            className="gig-btn mt-3"
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};
