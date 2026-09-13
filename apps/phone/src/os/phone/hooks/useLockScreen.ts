import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { phoneState } from './state';
import { usePhoneVisibility } from './usePhoneVisibility';

export const useLockScreen = () => {
  const [locked, setLocked] = useRecoilState(phoneState.lockState);
  const { visibility } = usePhoneVisibility();

  // Re-lock whenever the phone is put away, so the next open starts at the
  // lock screen again (matches a real phone locking when the screen turns off).
  useEffect(() => {
    if (!visibility) {
      setLocked(true);
    }
  }, [visibility, setLocked]);

  const unlock = () => setLocked(false);
  const lock = () => setLocked(true);

  return { locked, unlock, lock };
};
