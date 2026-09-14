import React from 'react';
import { Star } from 'lucide-react';
import { GigProfile } from '@typings/gigs';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={12}
        strokeWidth={0}
        fill="currentColor"
        className={i <= n ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}
      />
    ))}
  </span>
);

export const GigHistory: React.FC<{ profile: GigProfile | null }> = ({ profile }) => {
  if (!profile) return <LoadingSpinner />;

  return (
    <>
      <div className="mb-3 rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-neutral-800">
        <p className="text-4xl font-bold">{profile.rating ? profile.rating.toFixed(2) : '--'}</p>
        <p className="mt-1 text-sm text-neutral-500">Your rating</p>
      </div>

      {!profile.history.length && (
        <p className="py-12 text-center text-sm text-neutral-500">No jobs yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {profile.history.map((entry, i) => (
          <div
            key={`${entry.ts}-${i}`}
            className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{entry.name}</span>
              <Stars n={entry.stars} />
            </div>
            {entry.comment && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                &ldquo;{entry.comment}&rdquo;
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              {entry.aborted
                ? 'Cancelled'
                : `$${entry.pay}${entry.tip ? ` + $${entry.tip} tip` : ''}`}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};
