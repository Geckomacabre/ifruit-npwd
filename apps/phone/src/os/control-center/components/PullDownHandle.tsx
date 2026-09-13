import React from 'react';
import { useControlCenterOpen, useControlCenterMode } from '../state';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';
import { useDragOpen } from '../useDragOpen';

// Drag-catcher for the status bar band only (time/carrier/wifi/battery) --
// opens the full Control Center + Notifications panel. This one CAN be a
// plain overlay div because nothing tappable lives in that band. The
// "drag from the middle -> notifications only" gesture is deliberately NOT
// here: it's wired directly onto Home's own container (see Home.tsx) via
// the same useDragOpen hook, so it adds a listener to an existing element
// rather than laying a blocking div over the app icons underneath it.
export const PullDownHandle: React.FC = () => {
  const [isOpen, setIsOpen] = useControlCenterOpen();
  const [, setMode] = useControlCenterMode();
  const { locked } = useLockScreen();

  const openFull = useDragOpen(40, () => {
    setMode('full');
    setIsOpen(true);
  });

  if (isOpen || locked) return null;

  return <div className="absolute top-0 left-0 right-0 z-[55]" style={{ height: 50 }} {...openFull} />;
};
