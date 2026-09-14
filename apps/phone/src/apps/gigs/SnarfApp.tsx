import React from 'react';
import { GigShell } from './components/GigShell';

export const SnarfApp: React.FC = () => (
  <GigShell
    app="snarf"
    tagline="Food, delivered by whoever is nearby."
    dutyLabel="Delivering"
    emptyBoard="No deliveries on the board right now."
  />
);
