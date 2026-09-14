import React from 'react';
import { GigOffer } from '@typings/gigs';

interface IncomingFareProps {
  offer: GigOffer;
  seconds: number;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

/** How long a dispatch is offered for, so the bar has something to run down. */
const OFFER_WINDOW = 20;

// The card for a fare being pushed at you. The countdown comes from the client
// (see getLive) so it ticks every second without a server round trip.
export const IncomingFare: React.FC<IncomingFareProps> = ({
  offer,
  seconds,
  busy,
  onAccept,
  onDecline,
}) => (
  <div className="gig-request">
    <div className="flex items-baseline justify-between">
      <span className="gig-req-kind">{offer.playerRide ? 'Ride request' : offer.kindLabel}</span>
      <span className="text-[13px] font-bold">{seconds}s</span>
    </div>

    <div className="gig-clock">
      <i style={{ width: `${Math.min(100, (seconds / OFFER_WINDOW) * 100)}%` }} />
    </div>

    <p className="gig-pay mt-2.5">${offer.pay}</p>
    <p className="mt-1 text-[13px]">
      {offer.playerRide && offer.passengerName
        ? `${offer.passengerName} → ${offer.dropoffLabel}`
        : `${offer.pickupLabel} → ${offer.dropoffLabel}`}
    </p>
    <p className="gig-muted mt-1">{offer.distance?.toFixed(1)} km away</p>

    <div className="gig-btn-row">
      <button type="button" disabled={busy} onClick={onDecline} className="gig-btn ghost">
        Decline
      </button>
      <button type="button" disabled={busy} onClick={onAccept} className="gig-btn">
        Accept
      </button>
    </div>
  </div>
);
