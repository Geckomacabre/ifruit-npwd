import React from 'react';
import { GigShell } from './components/GigShell';

export const SnarfApp: React.FC = () => (
  <GigShell
    app="snarf"
    title="Snarf"
    accent="bg-[#f97316]"
    dutyLabel="Delivering"
    emptyBoard="No deliveries on the board right now."
  />
);
