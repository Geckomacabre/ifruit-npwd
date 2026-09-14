import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { cn } from '@utils/css';
import { GigApp } from '@typings/gigs';
import { useGigs } from '../useGigs';
import { IncomingFare } from './IncomingFare';
import { ActiveJob } from './ActiveJob';
import { OfferList } from './OfferList';
import { GigHistory } from './GigHistory';

interface GigShellProps {
  app: GigApp;
  title: string;
  /** Tailwind class for the app's accent, used on the duty switch and pay. */
  accent: string;
  dutyLabel: string;
  emptyBoard: string;
  /** rydeme's rider half; snarf has none. */
  rider?: (gigs: ReturnType<typeof useGigs>) => React.ReactNode;
}

type Tab = 'work' | 'profile';

// Everything both gig apps share: the duty switch, whatever work is on offer,
// the job you are on, and your rating. The Lua backend is the same for both --
// only the board/dispatch split and rydeme's rider mode differ.
export const GigShell: React.FC<GigShellProps> = ({
  app,
  title,
  accent,
  dutyLabel,
  emptyBoard,
  rider,
}) => {
  const gigs = useGigs(app);
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('work');
  const { state, profile, busy } = gigs;

  if (!state) {
    return (
      <AppWrapper id={`${app}-app`}>
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const lowRated = state.rating > 0 && state.rating < state.warnThreshold;

  const onAccept = async (id: number) => {
    const res = await gigs.accept(id);
    if (!res.ok) addAlert({ message: res.message ?? 'That job is gone.', type: 'error' });
  };

  return (
    <AppWrapper id={`${app}-app`}>
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <span className="flex items-center gap-1 text-sm font-semibold text-neutral-500">
            <Star size={14} fill="currentColor" strokeWidth={0} />
            {state.rating ? state.rating.toFixed(2) : '--'}
          </span>
        </header>

        <div className="flex gap-1 px-4 pb-3">
          {(['work', 'profile'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 rounded-full py-1.5 text-[13px] font-semibold capitalize transition-colors',
                tab === key
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
              )}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {tab === 'profile' ? (
            <GigHistory profile={profile} />
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => gigs.setDuty(!state.onDuty)}
                className="mb-3 flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm disabled:opacity-60 dark:bg-neutral-800"
              >
                <span>
                  <span className="block font-semibold">{dutyLabel}</span>
                  <span className="text-sm text-neutral-500">
                    {state.onDuty ? 'Taking work' : 'Not taking work'}
                  </span>
                </span>
                <span
                  className={cn(
                    'flex h-[31px] w-[51px] items-center rounded-full p-0.5 transition-colors',
                    state.onDuty ? accent : 'bg-neutral-300 dark:bg-neutral-600',
                  )}
                >
                  <span
                    className={cn(
                      'h-[27px] w-[27px] rounded-full bg-white shadow transition-transform',
                      state.onDuty && 'translate-x-5',
                    )}
                  />
                </span>
              </button>

              {state.incoming && (
                <IncomingFare
                  offer={state.incoming}
                  seconds={state.incomingSeconds ?? 0}
                  accent={accent}
                  busy={busy}
                  onAccept={() => onAccept(state.incoming!.id)}
                  onDecline={() => gigs.decline()}
                />
              )}

              {state.job && (
                <ActiveJob job={state.job} busy={busy} onCancel={() => gigs.cancel()} />
              )}

              {lowRated && (
                <p className="mb-3 rounded-2xl bg-amber-500/15 p-3 text-sm text-amber-600 dark:text-amber-400">
                  Your rating is below {state.warnThreshold.toFixed(1)} — you are only being shown
                  the cheapest work.
                </p>
              )}

              {state.serverFailed && (
                <p className="mb-3 rounded-2xl bg-red-500/15 p-3 text-sm text-red-500">
                  Can&apos;t reach dispatch right now.
                </p>
              )}

              {rider?.(gigs)}

              {!state.dispatchOnly && !state.job && (
                <OfferList
                  offers={state.offers}
                  accent={accent}
                  busy={busy}
                  empty={state.onDuty ? emptyBoard : 'Go on duty to see work.'}
                  onAccept={onAccept}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AppWrapper>
  );
};
