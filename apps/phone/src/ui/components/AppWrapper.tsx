import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { AppWrapperTypes } from '../interface/InterfaceUI';
import {
  appKeyFromPath,
  useAppCloseRequest,
  useIconOrigins,
  usePendingLaunchApp,
  LaunchOrigin,
} from '@os/apps/launchOrigin';

// Height of the iFruit status bar (clock/notch row, see StatusBar.tsx).
const STATUS_BAR_HEIGHT = 44;
const OPEN_DURATION = 380;
const CLOSE_DURATION = 320;

export const AppWrapper: React.FC<AppWrapperTypes> = ({
  children,
  style,
  handleClickAway,
  fullBleed,
  className,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const location = useLocation();
  // Home renders through here too, at "/" -- appKeyFromPath('/') is '', which
  // never matches a real app key, so Home naturally never triggers either
  // animation below.
  const appKey = appKeyFromPath(location.pathname);

  const [iconOrigins] = useIconOrigins();
  const [pendingLaunchApp, setPendingLaunchApp] = usePendingLaunchApp();
  const [closeRequested, setCloseRequested] = useAppCloseRequest();
  const [launchStyle, setLaunchStyle] = useState<React.CSSProperties | null>(null);

  // The transform that would make the full-size app look like the icon it
  // came from: scale down to the icon's size, then shift so the two centres
  // line up. Read before applying it, since it needs this element's OWN
  // full-size box -- the opposite direction from launchOrigin's box.
  const transformToOrigin = (origin: LaunchOrigin): string => {
    const selfRect = ref.current!.getBoundingClientRect();
    const screen = ref.current!.closest('.PhoneScreen');
    const screenRect = screen ? screen.getBoundingClientRect() : selfRect;
    const selfX = selfRect.left - screenRect.left;
    const selfY = selfRect.top - screenRect.top;
    const scaleX = origin.width / selfRect.width;
    const scaleY = origin.height / selfRect.height;
    const dx = origin.x + origin.width / 2 - (selfX + selfRect.width / 2);
    const dy = origin.y + origin.height / 2 - (selfY + selfRect.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
  };

  // Every app screen renders through here, so this is the one place that can
  // pick up a pending launch (see os/apps/launchOrigin.ts) and zoom in from
  // wherever its icon was actually tapped, the way iOS opens an app, instead
  // of just appearing.
  useLayoutEffect(() => {
    if (pendingLaunchApp !== appKey || !ref.current) return;
    setPendingLaunchApp(null);
    const origin = iconOrigins[appKey];
    if (!origin) return;

    setLaunchStyle({ transform: transformToOrigin(origin), opacity: 0, transition: 'none' });

    // Two rAFs: the first commits the starting transform, the second flips
    // to the resting state on its own frame so the browser actually paints
    // the start before animating -- collapsing both into one frame (or a
    // plain state update) skips straight to the end with no visible motion.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLaunchStyle({
          transform: 'translate(0, 0) scale(1, 1)',
          opacity: 1,
          transition: `transform ${OPEN_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${Math.round(
            OPEN_DURATION * 0.6,
          )}ms ease-out`,
        });
      });
    });

    const clearTimer = setTimeout(() => setLaunchStyle(null), OPEN_DURATION + 50);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(clearTimer);
    };
    // Runs once per mount only -- a fresh app screen is a fresh mount anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The home-indicator tap (Navigation.tsx) sets this instead of navigating
  // straight home, so the currently-mounted app gets to shrink back into the
  // same icon it grew from before it actually unmounts. Falls back to a
  // plain scale-down if this app was somehow reached without an icon origin
  // on record (there's no other way in today, but this keeps a future deep
  // link from just doing nothing on close).
  useEffect(() => {
    if (!closeRequested || !ref.current) return;

    const origin = iconOrigins[appKey];
    setLaunchStyle({
      transform: origin ? transformToOrigin(origin) : 'scale(0.85, 0.85)',
      opacity: 0,
      transition: `transform ${CLOSE_DURATION}ms cubic-bezier(0.32, 0, 0.67, 0), opacity ${CLOSE_DURATION}ms ease-in`,
    });

    const timer = setTimeout(() => {
      setCloseRequested(false);
      setLaunchStyle(null);
      history.push('/');
    }, CLOSE_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequested]);

  // By default an app starts below the status bar, on its own theme background
  // so no black band shows above it. fullBleed apps (home screen, apps that
  // paint behind the status bar) handle that spacing themselves.
  return (
    <div
      ref={ref}
      {...props}
      className={
        fullBleed ? className : ['bg-neutral-100 dark:bg-neutral-900', className].filter(Boolean).join(' ')
      }
      style={{
        padding: 0,
        // After the padding shorthand, or it would reset this back to 0.
        paddingTop: fullBleed ? 0 : STATUS_BAR_HEIGHT,
        margin: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        minHeight: '720px',
        ...style,
        ...launchStyle,
      }}
    >
      {children}
    </div>
  );
};
