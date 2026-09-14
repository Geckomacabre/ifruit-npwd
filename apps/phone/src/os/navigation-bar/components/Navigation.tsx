import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

// iFruit-style home indicator: no persistent button row (each app carries
// its own back affordance in its header). Just a slim pill at the very
// bottom of the screen -- tap it to jump straight home, same gesture a real
// gesture-nav phone uses a swipe-up for.
export const Navigation: React.FC = () => {
  const history = useHistory();
  const { isExact } = useRouteMatch('/');

  const handleGoHome = () => {
    if (isExact) return;
    history.push('/');
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
