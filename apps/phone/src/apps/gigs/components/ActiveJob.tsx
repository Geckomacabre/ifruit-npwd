import React, { useState } from 'react';
import { GigJob } from '@typings/gigs';

interface ActiveJobProps {
  job: GigJob;
  busy: boolean;
  onCancel: () => void;
}

const STAGE_LABEL: Record<string, string> = {
  pickup: 'Head to pickup',
  dropoff: 'Head to dropoff',
};

export const ActiveJob: React.FC<ActiveJobProps> = ({ job, busy, onCancel }) => {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="gig-card">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">{STAGE_LABEL[job.stage ?? ''] ?? 'On a job'}</span>
        <span className="gig-pay">${job.pay}</span>
      </div>

      <p className="mt-1.5 text-[13px]">
        {job.stage === 'dropoff' ? job.dropoffLabel : job.pickupLabel}
      </p>
      {job.passengerName && <p className="gig-muted mt-1">{job.passengerName}</p>}

      {/* Cancelling costs rating, so it asks twice. */}
      <button
        type="button"
        disabled={busy}
        onClick={() => (confirm ? onCancel() : setConfirm(true))}
        className="gig-btn danger mt-3"
      >
        {confirm ? 'Tap again — this costs rating' : 'Cancel job'}
      </button>
    </div>
  );
};
