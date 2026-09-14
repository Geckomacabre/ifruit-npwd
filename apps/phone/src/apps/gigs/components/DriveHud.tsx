import React from 'react';
import { GtaMap } from '@os/map/GtaMap';
import { cn } from '@utils/css';
import { GigCoords } from '@typings/gigs';

interface DriveHudProps {
  /** The driver's own position, refreshed once a second by getLive. */
  pos: GigCoords;
  /** Where this leg ends — pickup or dropoff, whichever is next. */
  target: GigCoords;
  speedMph?: number;
  /** Only sent while the dropoff leg is actually being scored. */
  speedLimit?: number;
  overLimit?: boolean;
}

/**
 * The phone-on-the-dash view: a map that follows the car, plus speed against
 * the posted limit. rydeme only — nobody is scoring how you drive a burrito
 * across town, so Snarf's jobs never carry the speed fields.
 */
export const DriveHud: React.FC<DriveHudProps> = ({
  pos,
  target,
  speedMph,
  speedLimit,
  overLimit,
}) => (
  <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
    <GtaMap
      className="h-40"
      follow={pos}
      markers={[
        { ...pos, kind: 'driver' },
        { ...target, kind: 'destination' },
      ]}
    />

    <div className="flex items-center justify-between px-4 py-3">
      <span className="flex items-baseline gap-1">
        <span className={cn('text-3xl font-bold tabular-nums', overLimit && 'text-red-500')}>
          {speedMph ?? 0}
        </span>
        <span className="text-xs text-neutral-500">mph</span>
      </span>

      {speedLimit != null && (
        // The posted limit, drawn as a speed-limit sign rather than a number
        // in a row of numbers -- it reads at a glance while driving.
        <span
          className={cn(
            'grid h-11 w-9 place-items-center rounded border-[3px] bg-white text-black',
            overLimit ? 'border-red-500' : 'border-neutral-800',
          )}
        >
          <span className="text-base font-bold tabular-nums leading-none">{speedLimit}</span>
        </span>
      )}
    </div>
  </div>
);
