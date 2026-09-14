import React, { useEffect, useMemo, useState } from 'react';
import { BatteryFull, Camera, Cloud, Flashlight, Moon } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import usePhoneTime from '@os/phone/hooks/usePhoneTime';
import fetchNui from '@utils/fetchNui';
import { WeatherData, WeatherEvents } from '@typings/weather';
import { BrowserWeather, lookFor } from '../../../apps/weather/utils/conditions';
import { useDoNotDisturb, useFlashlight } from '@os/control-center/state';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';
import { cn } from '@utils/css';
import '../lockscreen.css';

// The furniture shared by the lock screen and Notification Center: both are
// the same surface in iOS, one with the notification list expanded.

export const LockClock: React.FC = () => {
  const time = usePhoneTime();
  const date = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    [],
  );

  return (
    <div className="flex flex-col items-center">
      <span className="lock-date">{date}</span>
      <span className="lock-clock">{time || '9:41'}</span>
    </div>
  );
};

export const LockWidgets: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNui<WeatherData>(WeatherEvents.FETCH, undefined, BrowserWeather)
      .then((data) => !cancelled && setWeather(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="lock-widget flex items-start justify-between px-7 text-[15px] font-semibold">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          <BatteryFull size={15} />
          100%
        </span>
        <p className="text-[15px]">iFruit</p>
        <div className="mt-1 h-[3px] w-[104px] rounded-full bg-current" />
      </div>

      {weather && (
        <div className="min-w-0 text-left">
          <span className="flex items-center gap-1.5">
            <Cloud size={15} />
            {weather.temperature}°
          </span>
          <p>{lookFor(weather.condition).label}</p>
          <p>
            H:{weather.high}° L:{weather.low}°
          </p>
        </div>
      )}
    </div>
  );
};

export const LockControls: React.FC<{ onCamera?: () => void }> = ({ onCamera }) => {
  const history = useHistory();
  const { unlock } = useLockScreen();
  const [doNotDisturb] = useDoNotDisturb();
  const [flashlight, setFlashlight] = useFlashlight();

  const openCamera = () => {
    if (onCamera) return onCamera();
    unlock();
    history.push('/camera');
  };

  return (
    <div className="flex items-center justify-between px-8">
      <LockButton
        label="Flashlight"
        active={flashlight}
        onClick={() => setFlashlight((v) => !v)}
        icon={<Flashlight size={22} fill={flashlight ? 'currentColor' : 'none'} />}
      />

      {doNotDisturb ? (
        <span className="flex items-center gap-1.5 text-[15px] font-medium text-white/90 drop-shadow">
          <Moon size={15} fill="currentColor" strokeWidth={0} />
          Do Not Disturb
        </span>
      ) : (
        <span className="text-[13px] font-medium text-white/70 drop-shadow">Swipe up to unlock</span>
      )}

      <LockButton label="Camera" onClick={openCamera} icon={<Camera size={22} />} />
    </div>
  );
};

// stopPropagation so tapping a control doesn't also start an unlock drag.
const LockButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
    onClick={onClick}
    className={cn(
      'flex h-[54px] w-[54px] items-center justify-center rounded-full transition-colors',
      active ? 'bg-white text-black' : 'lock-control text-white',
    )}
  >
    {icon}
  </button>
);
