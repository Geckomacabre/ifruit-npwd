import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';
import { useAppCloseRequest } from '@os/apps/launchOrigin';

// iFruit-style home indicator: no persistent button row (each app carries
// its own back affordance in its header). Just a slim pill at the very
// bottom of the screen -- tap it to jump straight home, same gesture a real
// gesture-nav phone uses a swipe-up for.
export const Navigation: React.FC = () => {
  const { isExact } = useRouteMatch('/');
  const { locked } = useLockScreen();
  const [, setCloseRequested] = useAppCloseRequest();

  // Only shows inside an app. The home screen and lock screen are already
  // "home", so the indicator has nothing to go back to there.
  if (isExact || locked) return null;

  // Doesn't navigate directly -- the currently-mounted app's own AppWrapper
  // owns the DOM node that needs to shrink back into its icon first (see
  // os/apps/launchOrigin.ts), and only pushes to "/" once that finishes.
  const handleGoHome = () => {
    setCloseRequested(true);
  };

  // Floats over the app instead of taking a row of its own, so apps run to the
  // bottom edge of the screen with only the pill on top. Difference blending
  // keeps the pill readable over both light and dark apps.
  return (
    <div className="NavigationIndicator pointer-events-none absolute bottom-0 left-0 right-0 z-[55] flex h-6 items-end justify-center pb-2">
      <button
        onClick={handleGoHome}
        aria-label="Go home"
        className="pointer-events-auto h-1.5 w-32 rounded-full bg-white mix-blend-difference"
      />
    </div>
  );
};
