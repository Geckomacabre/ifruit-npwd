import React from 'react';
import { Plane, Moon } from 'lucide-react';
import usePhoneTime from '@os/phone/hooks/usePhoneTime';
import { SignalBars, WifiGlyph, BatteryGlyph } from './StatusBarIcons';
import { useAirplaneMode, useWifiEnabled, useDoNotDisturb } from '@os/control-center/state';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';

// iFruit-style status bar: no bar chrome of its own -- just the clock and
// signal/wifi/battery cluster floating over the top of whatever's on screen,
// flanking the notch cut into the frame image rather than sitting below it.
// Text/icon color follows the app's light/dark theme (see Phone.tsx, which
// toggles the `dark` class on <html> from settings.theme) rather than being
// hardcoded, so it stays legible on both.
export const StatusBar: React.FC = () => {
  const time = usePhoneTime();
  const [airplaneMode] = useAirplaneMode();
  const [wifiEnabled] = useWifiEnabled();
  const { locked } = useLockScreen();
  const [doNotDisturb] = useDoNotDisturb();

  // Positioned to exactly match the notch cut into the ifruit.png frame
  // (screen-local coords: notch spans y:12-41, x:145-256 out of a 400x800
  // screen) rather than padded down from the top -- top/height here pin
  // this row to precisely the same band the pill occupies, so the clock and
  // icons sit level with it instead of reading as a separate strip below it.
  return (
    <div
      className={`StatusBar absolute left-0 right-0 z-[60] pointer-events-none flex items-center pl-8 pr-4 text-black dark:text-white ${
        locked ? 'justify-end' : 'justify-between'
      }`}
      style={{ top: 12, height: 29 }}
    >
      {/* Real iOS drops the status-bar clock on the lock screen -- the big
          lock-screen clock is already the time, so showing it twice reads as
          a bug rather than a design choice. */}
      {!locked && (
        <span className="flex items-center gap-1.5 text-[16px] font-bold tabular-nums leading-none">
          {time || '9:41'}
          {doNotDisturb && <Moon size={13} fill="currentColor" strokeWidth={0} />}
        </span>
      )}
      <div className="flex items-center gap-[5px]">
        {airplaneMode ? (
          <Plane className="h-3 w-3" strokeWidth={2.5} />
        ) : (
          <>
            <SignalBars className="h-3 w-[18px]" />
            {wifiEnabled && <WifiGlyph className="h-[13px] w-[18px]" />}
          </>
        )}
        <BatteryGlyph className="h-[15px] w-[29px]" />
      </div>
    </div>
  );
};
