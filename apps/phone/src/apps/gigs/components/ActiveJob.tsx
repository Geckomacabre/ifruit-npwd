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
    <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">{STAGE_LABEL[job.stage ?? ''] ?? 'On a job'}</span>
        <span className="text-lg font-bold">${job.pay}</span>
      </div>

      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
        {job.stage === 'dropoff' ? job.dropoffLabel : job.pickupLabel}
      </p>
      {job.passengerName && <p className="mt-0.5 text-xs text-neutral-500">{job.passengerName}</p>}

      {/* Cancelling costs rating, so it asks twice. */}
      <button
        type="button"
        disabled={busy}
        onClick={() => (confirm ? onCancel() : setConfirm(true))}
        className="mt-3 w-full rounded-full bg-neutral-200 py-2 text-sm font-semibold text-red-500 disabled:opacity-60 dark:bg-neutral-700"
      >
        {confirm ? 'Tap again — this costs rating' : 'Cancel job'}
      </button>
    </div>
  );
};
