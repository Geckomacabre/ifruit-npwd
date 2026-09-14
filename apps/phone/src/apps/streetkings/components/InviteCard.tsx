import React, { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { StreetKingsInvite } from '@typings/streetkings';
import { countdown } from '../utils';

interface InviteCardProps {
  invite: StreetKingsInvite;
  onAccept: () => void;
  onDecline: () => void;
}

export const InviteCard: React.FC<InviteCardProps> = ({ invite, onAccept, onDecline }) => {
  // The bridge sends the remaining time once, as a duration; ticking it down
  // here keeps the card honest between polls without hammering the callback.
  const [remaining, setRemaining] = useState(invite.expiresInMs);

  useEffect(() => {
    setRemaining(invite.expiresInMs);
  }, [invite.expiresInMs, invite.rival]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    // shrink-0: the card is pinned above a flex-1 scroll region, and without it
    // flexbox squeezes the card instead of the list, spilling it over the panel.
    <div className="mx-4 mb-4 shrink-0 rounded-3xl bg-red-600 p-4 text-white">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/70">
        <Flag size={13} />
        Challenge · {countdown(remaining)}
      </p>
      <p className="mt-1 text-lg font-bold">{invite.rival}</p>
      <p className="mt-0.5 text-sm text-white/85">{invite.message}</p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 rounded-full bg-white py-2 text-sm font-bold text-red-600"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex-1 rounded-full bg-white/20 py-2 text-sm font-semibold"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
