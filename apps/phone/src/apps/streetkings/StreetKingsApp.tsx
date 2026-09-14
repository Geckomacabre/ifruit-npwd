import React, { useCallback, useEffect, useState } from 'react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNuiResource from '@utils/fetchNuiResource';
import { cn } from '@utils/css';
import {
  StreetKingsBoot,
  StreetKingsEvents,
  StreetKingsInvite,
  StreetKingsProfile,
  StreetKingsResult,
  STREETKINGS_RESOURCE,
} from '@typings/streetkings';
import { CareerPanel } from './components/CareerPanel';
import { InviteCard } from './components/InviteCard';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { BrowserBoot, BrowserInvite, BrowserProfile } from './utils';

type Tab = 'career' | 'times';

/** How often to ask whether a rival has thrown down. */
const INVITE_POLL_MS = 5000;

export const StreetKingsApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('career');
  const [boot, setBoot] = useState<StreetKingsBoot | null>(null);
  const [profile, setProfile] = useState<StreetKingsProfile | null>(null);
  const [invite, setInvite] = useState<StreetKingsInvite | null>(null);

  const call = useCallback(
    <T,>(event: StreetKingsEvents, data?: unknown, mock?: T) =>
      fetchNuiResource<T>(STREETKINGS_RESOURCE, event, data, mock),
    [],
  );

  const loadInvite = useCallback(async () => {
    // getPending returns nil when there is nothing, which arrives as `false`.
    const pending = await call<StreetKingsInvite | false>(
      StreetKingsEvents.GET_INVITE,
      undefined,
      BrowserInvite,
    );
    setInvite(pending || null);
  }, [call]);

  useEffect(() => {
    Promise.all([
      call<StreetKingsBoot>(StreetKingsEvents.BOOT, undefined, BrowserBoot),
      call<StreetKingsProfile>(StreetKingsEvents.GET_PROFILE, undefined, BrowserProfile),
    ])
      .then(([bootData, profileData]) => {
        setBoot(bootData);
        setProfile(profileData);
      })
      .catch(console.error);

    loadInvite().catch(console.error);
    const id = window.setInterval(() => loadInvite().catch(console.error), INVITE_POLL_MS);
    return () => window.clearInterval(id);
  }, [call, loadInvite]);

  const answerInvite = async (accept: boolean) => {
    const result = await call<StreetKingsResult>(
      accept ? StreetKingsEvents.ACCEPT_INVITE : StreetKingsEvents.DECLINE_INVITE,
      undefined,
      { ok: true },
    );

    if (!result?.ok) {
      addAlert({ message: 'That challenge is no longer open.', type: 'error' });
    } else if (accept) {
      addAlert({ message: 'Waypoint set. Get moving.', type: 'success' });
    }
    setInvite(null);
  };

  if (!boot || !profile) {
    return (
      <AppWrapper id="streetkings-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper id="streetkings-app">
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">Street Kings</h1>
        </header>

        <div className="flex gap-1 px-4 pb-3">
          {(['career', 'times'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 rounded-full py-1.5 text-[13px] font-semibold transition-colors',
                tab === key
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
              )}
            >
              {key === 'career' ? 'Career' : 'Leaderboards'}
            </button>
          ))}
        </div>

        {invite && (
          <InviteCard
            invite={invite}
            onAccept={() => answerInvite(true)}
            onDecline={() => answerInvite(false)}
          />
        )}

        {tab === 'career' ? (
          <div className="flex-1 overflow-y-auto">
            <CareerPanel profile={profile} charName={boot.charName} />
          </div>
        ) : (
          <LeaderboardPanel boot={boot} charName={boot.charName} />
        )}
      </div>
    </AppWrapper>
  );
};
