import React from 'react';
import { GigShell } from './components/GigShell';
import { RiderPanel } from './components/RiderPanel';

export const RydemeApp: React.FC = () => (
  <GigShell
    app="goober"
    title="rydeme"
    accent="bg-[#14b8a6]"
    dutyLabel="Driving"
    emptyBoard="Fares are sent to you — stay on duty."
    rider={(gigs) => <RiderPanel gigs={gigs} />}
  />
);
