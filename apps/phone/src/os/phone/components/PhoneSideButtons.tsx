import React from 'react';
import { useSettings } from '../../../apps/settings/hooks/useSettings';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';

// Physical-looking side buttons on the case itself (outside the screen area):
// two volume buttons on the left, one power/wake button on the right. All
// three are functional, not just decoration -- volume nudges callVolume,
// power locks the screen.
export const PhoneSideButtons: React.FC = () => {
  const [settings, setSettings] = useSettings();
  const { locked, unlock, lock } = useLockScreen();

  const adjustVolume = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      callVolume: Math.max(0, Math.min(100, prev.callVolume + delta)),
    }));
  };

  const handlePower = () => {
    if (locked) {
      unlock();
    } else {
      lock();
    }
  };

  const buttonBase =
    'absolute bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors rounded-sm shadow-md';

  return (
    <>
      <button
        aria-label="Volume up"
        onClick={() => adjustVolume(10)}
        className={buttonBase}
        style={{ left: 30, top: 250, width: 4, height: 55 }}
      />
      <button
        aria-label="Volume down"
        onClick={() => adjustVolume(-10)}
        className={buttonBase}
        style={{ left: 30, top: 320, width: 4, height: 55 }}
      />
      <button
        aria-label="Power"
        onClick={handlePower}
        className={buttonBase}
        style={{ right: 30, top: 280, width: 4, height: 70 }}
      />
    </>
  );
};
