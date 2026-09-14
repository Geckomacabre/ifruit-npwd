import React, { useEffect, useRef, useState } from 'react';
import { Moon, Plane, Wifi, SunMedium } from 'lucide-react';
import {
  useControlCenterOpen,
  useControlCenterMode,
  useDoNotDisturb,
  useAirplaneMode,
  useWifiEnabled,
} from '../state';
import { useUnreadNotificationIds } from '@os/new-notifications/state';
import { useNotification } from '@os/new-notifications/useNotification';
import { QuickToggle } from './QuickToggle';
import { NotificationCard } from './NotificationCard';
import { useSettings } from '../../../apps/settings/hooks/useSettings';

// Combined Notification Center + Control Center, opened by dragging down
// from the status bar (see PullDownHandle) or, in notifications-only mode,
// from anywhere on the home screen (see Home.tsx). Closed by dragging the
// panel back up, tapping the backdrop, or after clearing notifications.
export const ControlCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useControlCenterOpen();
  const [mode] = useControlCenterMode();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  const [doNotDisturb, setDoNotDisturb] = useDoNotDisturb();
  const [airplaneMode, setAirplaneMode] = useAirplaneMode();
  const [wifiEnabled, setWifiEnabled] = useWifiEnabled();
  const [settings, setSettings] = useSettings();

  const unreadIds = useUnreadNotificationIds();
  const { markAllAsRead } = useNotification();

  // Window-level listeners once dragging starts, same reasoning as
  // useDragOpen: a plain onMouseMove on the panel stops firing the instant
  // the cursor moves outside the panel's own bounds mid-drag.
  useEffect(() => {
    if (!dragging) return;

    const onMove = (clientY: number) => {
      const delta = clientY - startYRef.current;
      setDragY(Math.min(0, delta));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);
    const onEnd = () => {
      setDragging(false);
      setDragY((currentDragY) => {
        if (currentDragY < -80) setIsOpen(false);
        return 0;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging, setIsOpen]);

  if (!isOpen) return null;

  const startDrag = (clientY: number) => {
    setDragging(true);
    startYRef.current = clientY;
  };

  const toggleTheme = () => {
    const isDark = settings.theme.value === 'taso-dark';
    setSettings((prev) => ({
      ...prev,
      theme: isDark ? { label: 'Light', value: 'default-light' } : { label: 'Dark', value: 'taso-dark' },
    }));
  };

  return (
    <>
      <div className="absolute inset-0 z-[70] bg-black/40" onClick={() => setIsOpen(false)} />
      <div
        className="liquid-glass liquid-glass-dark absolute left-0 right-0 top-0 z-[71] pt-12 px-4 pb-6 rounded-b-[32px] border-t-0 overflow-y-auto max-h-full"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 200ms',
        }}
        onMouseDown={(e) => startDrag(e.clientY)}
        onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      >
        <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-white/40" />

        {mode === 'full' && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <QuickToggle
              label="Airplane"
              active={airplaneMode}
              onClick={() => setAirplaneMode((v) => !v)}
              icon={<Plane size={20} />}
            />
            <QuickToggle
              label="Wi-Fi"
              active={wifiEnabled}
              onClick={() => setWifiEnabled((v) => !v)}
              icon={<Wifi size={20} />}
            />
            <QuickToggle
              label="Silence"
              active={doNotDisturb}
              onClick={() => setDoNotDisturb((v) => !v)}
              icon={<Moon size={20} />}
            />
            <QuickToggle
              label="Theme"
              active={settings.theme.value !== 'taso-dark'}
              onClick={toggleTheme}
              icon={<SunMedium size={20} />}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-white/80 text-sm font-semibold">Notifications</span>
          {unreadIds.length > 0 && (
            <button
              className="text-blue-400 text-sm font-medium"
              onClick={() => markAllAsRead()}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {unreadIds.length === 0 && (
            <div className="text-center text-white/50 text-sm py-8">No Notifications</div>
          )}
          {unreadIds.map((id) => (
            <NotificationCard key={id} id={id} />
          ))}
        </div>
      </div>
    </>
  );
};
