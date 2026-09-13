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

  return (
    <div className="NavigationIndicator w-full h-8 flex items-end justify-center pb-2">
      <button
        onClick={handleGoHome}
        aria-label="Go home"
        className="h-1.5 w-32 rounded-full bg-white/80 hover:bg-white transition-colors"
      />
    </div>
  );
};
