import React, { useState } from 'react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { cn } from '@utils/css';
import { GigApp } from '@typings/gigs';
import { useGigs } from '../useGigs';
import { Confetti, Wordmark } from './Brand';
import { IncomingFare } from './IncomingFare';
import { ActiveJob } from './ActiveJob';
import { DriveHud } from './DriveHud';
import { OfferList } from './OfferList';
import { GigHistory } from './GigHistory';
import '../gigs.css';

interface GigShellProps {
  app: GigApp;
  tagline: string;
  /** What the duty switch is called: "Driving", "Delivering". */
  dutyLabel: string;
  emptyBoard: string;
  /** rydeme's rider half, shown on its own tab. Snarf has none. */
  rider?: (gigs: ReturnType<typeof useGigs>) => React.ReactNode;
}

type Tab = 'work' | 'ride' | 'profile';

const stars = (rating: number) => '★★★★★'.slice(0, Math.round(rating)).padEnd(5, '☆');

// Everything both gig apps share. The Lua backend is the same for both -- only
// the board/dispatch split, rydeme's rider tab and the brand differ, so this
// shell wears two skins (see gigs.css) rather than existing twice.
export const GigShell: React.FC<GigShellProps> = ({
  app,
  tagline,
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
      <AppWrapper
        id={`${app}-app`}
        className={cn('gig-root', app === 'snarf' ? 'snarf' : 'rydeme')}
        style={{ background: 'var(--bg)' }}
      >
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const lowRated = state.rating > 0 && state.rating < state.warnThreshold;

  const onAccept = async (id: number) => {
    const res = await gigs.accept(id);
    if (!res.ok) addAlert({ message: res.message ?? 'That job is gone.', type: 'error' });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'work', label: app === 'snarf' ? 'Orders' : 'Rides' },
    ...(rider ? [{ id: 'ride' as Tab, label: 'Ride' }] : []),
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <AppWrapper
      id={`${app}-app`}
      className={cn('gig-root', app === 'snarf' ? 'snarf' : 'rydeme')}
      // Inline, because AppWrapper's own neutral background is a class and
      // would otherwise win. var(--bg) resolves off the brand class above.
      //
      // On the profile tab this is the accent, not the background: the profile
      // bar runs to the very top of the screen in the reference, and the strip
      // behind the status bar has to be the same colour for it to read that way.
      style={{ background: tab === 'profile' ? 'var(--accent)' : 'var(--bg)' }}
    >
      {/* relative: the rider's map picker covers the app from in here. */}
      <div className="gig-app relative">
        {tab === 'profile' ? (
          <div className="gig-profile-bar">Driver Profile</div>
        ) : (
          <header className="gig-header confetti">
            <Confetti />
            <Wordmark app={app} />
            <p className="gig-tagline">{tagline}</p>
            <p className="gig-rating">
              <span className="tracking-[2px]">{stars(state.rating)}</span>{' '}
              {state.rating ? state.rating.toFixed(2) : '--'}
            </p>
          </header>
        )}

        <div className="gig-body">
          {tab === 'profile' && (
            <>
              <div className="gig-hero confetti">
                <Confetti />
                <Wordmark app={app} />
              </div>
              <GigHistory profile={profile} />
            </>
          )}

          {tab === 'ride' && rider?.(gigs)}

          {tab === 'work' && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => gigs.setDuty(!state.onDuty)}
                className={cn('gig-btn', !state.onDuty && 'ghost')}
              >
                {state.onDuty ? `Online · tap to stop` : `Go online · ${dutyLabel}`}
              </button>

              {state.incoming && (
                <div className="mt-3">
                  <IncomingFare
                    offer={state.incoming}
                    seconds={state.incomingSeconds ?? 0}
                    busy={busy}
                    onAccept={() => onAccept(state.incoming!.id)}
                    onDecline={() => gigs.decline()}
                  />
                </div>
              )}

              {state.job && state.pos && state.target && (
                <div className="mt-3">
                  <DriveHud
                    pos={state.pos}
                    target={state.target}
                    speedMph={state.speedMph}
                    speedLimit={state.speedLimit}
                    overLimit={state.overLimit}
                  />
                </div>
              )}

              {state.job && (
                <div className="mt-3">
                  <ActiveJob job={state.job} busy={busy} onCancel={() => gigs.cancel()} />
                </div>
              )}

              {lowRated && (
                <p className="gig-card mt-3 text-[12px]" style={{ borderColor: 'var(--accent)' }}>
                  Your rating is below {state.warnThreshold.toFixed(1)} — you are only being shown
                  the cheapest work.
                </p>
              )}

              {state.serverFailed && (
                <p className="gig-card mt-3 text-[12px] text-red-400">
                  Can&apos;t reach dispatch right now.
                </p>
              )}

              {/* rydeme has no board: fares are dispatched to you, so the
                  waiting state IS the screen rather than an empty list. */}
              {state.dispatchOnly && !state.job && !state.incoming && (
                <div className="pt-8 text-center">
                  {state.onDuty && <div className="gig-pulse" />}
                  <p className="font-semibold">
                    {state.onDuty ? 'Looking for riders…' : 'You are offline'}
                  </p>
                  <p className="gig-muted mx-auto mt-2 max-w-[15rem]">
                    {state.onDuty ? emptyBoard : 'Go online to start getting ride requests.'}
                  </p>
                </div>
              )}

              {!state.dispatchOnly && !state.job && (
                <div className="mt-3">
                  <OfferList
                    offers={state.offers}
                    busy={busy}
                    empty={state.onDuty ? emptyBoard : 'Go on duty to see work.'}
                    onAccept={onAccept}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <nav className="gig-tabs">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(tab === item.id && 'on')}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </AppWrapper>
  );
};
