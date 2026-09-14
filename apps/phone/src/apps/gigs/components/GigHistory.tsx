import React from 'react';
import { GigProfile } from '@typings/gigs';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';

/** Filled and hollow stars, matching the reference's plain glyph row. */
const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="shrink-0 text-[12px] tracking-[1px]">
    {'★'.repeat(n)}
    <span className="opacity-35">{'☆'.repeat(Math.max(0, 5 - n))}</span>
  </span>
);

export const GigHistory: React.FC<{ profile: GigProfile | null }> = ({ profile }) => {
  if (!profile) return <LoadingSpinner />;

  return (
    <>
      <div className="pb-5 text-center">
        <p className="gig-big-number">{profile.rating ? profile.rating.toFixed(2) : '--'}</p>
        <p className="mt-0.5 text-[15px]">
          <Stars n={Math.round(profile.rating)} />
        </p>
        <p className="gig-muted mt-1.5">
          {profile.history.length} recent {profile.history.length === 1 ? 'job' : 'jobs'}
        </p>
      </div>

      {!profile.history.length && <p className="gig-muted py-12 text-center">No jobs yet.</p>}

      <div className="flex flex-col gap-2.5">
        {profile.history.map((entry, i) => (
          <div key={`${entry.ts}-${i}`} className="gig-card">
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{entry.name}</span>
                {entry.aborted && (
                  <span className="gig-pill accent mt-1.5 inline-block">never arrived</span>
                )}
              </span>
              <Stars n={entry.stars} />
            </div>

            {entry.comment && (
              <p className="mt-2 text-[13px] italic">&ldquo;{entry.comment}&rdquo;</p>
            )}

            <p className="gig-muted mt-1.5">
              {entry.aborted ? '$0' : `$${entry.pay}${entry.tip ? ` + $${entry.tip} tip` : ''}`}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};
