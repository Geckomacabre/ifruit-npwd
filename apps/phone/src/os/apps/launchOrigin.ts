import { atom, useRecoilState } from 'recoil';

// The cache below is keyed by an app's first path segment ("/calculator" ->
// "calculator") rather than its registry id, so AppWrapper can identify
// which app it's rendering purely from useLocation() -- no need to pull in
// the app registry (useApps, with its notifications/settings/lazy-icon
// dependencies) just to answer "which app is this".
export const appKeyFromPath = (pathname: string): string => pathname.replace(/^\//, '').split('/')[0];

// An icon's box (relative to the phone screen, not the browser viewport) at
// the moment it was last tapped from the home screen or dock.
export interface LaunchOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Keyed by app id. Updated (not cleared) on every tap, so the icon's
// position survives the whole time an app is open -- unlike a one-shot
// value, this is still around when the app closes and needs to shrink back
// into the same spot, even though the home screen isn't mounted to measure
// it again at that point.
const iconOriginsState = atom<Record<string, LaunchOrigin>>({
  key: 'appIconOrigins',
  default: {},
});

export const useIconOrigins = () => useRecoilState(iconOriginsState);

// One-shot: which app id is currently launching. AppWrapper reads this on
// mount to play the zoom-in animation, then clears it.
const pendingLaunchAppState = atom<string | null>({
  key: 'pendingLaunchApp',
  default: null,
});

export const usePendingLaunchApp = () => useRecoilState(pendingLaunchAppState);

// Set by the home-indicator tap instead of navigating straight home.
// AppWrapper (which owns the DOM node that needs to animate) picks this up,
// plays the shrink-back-into-the-icon animation, and only then performs the
// actual navigation -- so the close is a real animation, not a cut.
const closeRequestState = atom<boolean>({
  key: 'appCloseRequest',
  default: false,
});

export const useAppCloseRequest = () => useRecoilState(closeRequestState);
