import React from 'react';
import { useControlCenterOpen, useControlCenterMode } from '../state';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';
import { useDragOpen } from '../useDragOpen';

// Drag-catcher for the status bar band only (time/carrier/wifi/battery).
// Split down the middle the way a real gesture-nav phone does it: the clock
// side pulls down Notification Center, the battery/wifi side pulls down
// Control Center. These CAN be plain overlay divs because nothing tappable
// lives in that band. Dragging from the middle of the home screen also opens
// notifications -- that one is wired onto Home's own container (see Home.tsx)
// so it doesn't lay a blocking div over the app icons.
export const PullDownHandle: React.FC = () => {
  const [isOpen, setIsOpen] = useControlCenterOpen();
  const [, setMode] = useControlCenterMode();
  const { locked } = useLockScreen();

  const openNotifications = useDragOpen(40, () => {
    setMode('notifications');
    setIsOpen(true);
  });

  const openControlCenter = useDragOpen(40, () => {
    setMode('full');
    setIsOpen(true);
  });

  if (isOpen || locked) return null;

  return (
    <>
      <div
        className="absolute left-0 top-0 z-[55]"
        style={{ height: 50, width: '50%' }}
        {...openNotifications}
      />
      <div
        className="absolute right-0 top-0 z-[55]"
        style={{ height: 50, width: '50%' }}
        {...openControlCenter}
      />
    </>
  );
};
