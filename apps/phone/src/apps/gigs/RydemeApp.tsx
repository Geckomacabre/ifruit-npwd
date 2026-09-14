import React from 'react';
import { GigShell } from './components/GigShell';
import { RiderPanel } from './components/RiderPanel';

export const RydemeApp: React.FC = () => (
  <GigShell
    app="goober"
    tagline="Rides from strangers, priced dynamically."
    dutyLabel="Driving"
    emptyBoard="Stay near a busy area. You will get a notification and a few seconds to answer."
    rider={(gigs) => <RiderPanel gigs={gigs} />}
  />
);
