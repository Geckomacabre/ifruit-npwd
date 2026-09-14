import { useCallback, useEffect, useRef, useState } from 'react';
import fetchNui from '@utils/fetchNui';
import {
  GigActionResult,
  GigApp,
  GigEvents,
  GigProfile,
  GigState,
} from '@typings/gigs';
import { mockProfile, mockState } from './mock';

// Two polls on purpose, at different rates. getState is a server round trip
// (board, rating, duty) and only needs to be occasional; getLive is answered
// on the client and carries the countdown on an incoming fare, which has to
// tick smoothly.
const STATE_MS = 4000;
const LIVE_MS = 1000;

export const useGigs = (app: GigApp) => {
  const [state, setState] = useState<GigState | null>(null);
  const [profile, setProfile] = useState<GigProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  const loadState = useCallback(async () => {
    const resp = await fetchNui<GigState>(GigEvents.GET_STATE, { app }, mockState(app));
    if (mounted.current) setState(resp);
  }, [app]);

  const loadProfile = useCallback(async () => {
    const resp = await fetchNui<GigProfile>(GigEvents.GET_PROFILE, { app }, mockProfile);
    if (mounted.current) setProfile(resp);
  }, [app]);

  useEffect(() => {
    mounted.current = true;
    loadState().catch(console.error);
    loadProfile().catch(console.error);

    const stateTimer = window.setInterval(() => loadState().catch(console.error), STATE_MS);

    // Merges the live fields over the last full state rather than replacing
    // it, so the board and rating don't blink out between server polls.
    const liveTimer = window.setInterval(() => {
      fetchNui<Partial<GigState>>(GigEvents.GET_LIVE, undefined, {})
        .then((live) => {
          if (!mounted.current || !live) return;
          setState((cur) => (cur ? { ...cur, ...live } : cur));
        })
        .catch(console.error);
    }, LIVE_MS);

    return () => {
      mounted.current = false;
      window.clearInterval(stateTimer);
      window.clearInterval(liveTimer);
    };
  }, [loadState, loadProfile]);

  const act = useCallback(
    async (event: GigEvents, data?: unknown): Promise<GigActionResult> => {
      setBusy(true);
      try {
        const resp = await fetchNui<GigActionResult>(event, data, { ok: true });
        await loadState();
        return resp ?? { ok: false };
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [loadState],
  );

  return {
    state,
    profile,
    busy,
    reload: loadState,
    reloadProfile: loadProfile,
    setDuty: (on: boolean) => act(GigEvents.SET_DUTY, { app, on }),
    accept: (id: number) => act(GigEvents.ACCEPT, { app, id }),
    decline: () => act(GigEvents.DECLINE),
    cancel: () => act(GigEvents.CANCEL),
    requestRide: (data: unknown) => act(GigEvents.REQUEST_RIDE, data),
    cancelRide: () => act(GigEvents.CANCEL_RIDE),
    rateDriver: (stars: number) => act(GigEvents.RATE_DRIVER, { stars }),
  };
};
