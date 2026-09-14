import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Bluetooth,
  Calculator,
  Camera,
  Cast,
  ChevronsUpDown,
  Contrast,
  Flashlight,
  Lock,
  Mic,
  Moon,
  Plane,
  Play,
  Power,
  Radio,
  Settings as SettingsGlyph,
  Share2,
  Signal,
  SkipBack,
  SkipForward,
  SunMedium,
  Timer,
  Volume2,
  BatteryLow,
} from 'lucide-react';
import {
  useControlCenterOpen,
  useControlCenterMode,
  useDoNotDisturb,
  useAirplaneMode,
  useWifiEnabled,
  useCellularEnabled,
  useBluetoothEnabled,
  useNearbyEnabled,
  useHotspotEnabled,
  useRotationLock,
  useLowPowerMode,
  useFlashlight,
  useBrightness,
} from '../state';
import { useSetRecoilState } from 'recoil';
import { useUnreadNotificationIds } from '@os/new-notifications/state';
import { useNotification } from '@os/new-notifications/useNotification';
import { phoneState } from '@os/phone/hooks/state';
import { NotificationCard } from './NotificationCard';
import { CircleToggle } from './CircleToggle';
import { GlassSlider } from './GlassSlider';
import { WifiGlyph } from '@os/status-bar/components/StatusBarIcons';
import { useSettings } from '../../../apps/settings/hooks/useSettings';
import '../controlCenter.css';

// Two panels behind one gesture, matching how a real gesture-nav phone splits
// them: dragging down the left of the status bar gives Notification Center,
// the right gives Control Center (see PullDownHandle). Both are dismissed by
// dragging back up or tapping the dimmed backdrop.
export const ControlCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useControlCenterOpen();
  const [mode] = useControlCenterMode();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const history = useHistory();
  // Setter only: useLockScreen would also subscribe this panel to phone
  // visibility and settings just to power one button.
  const setLocked = useSetRecoilState(phoneState.lockState);

  const [doNotDisturb, setDoNotDisturb] = useDoNotDisturb();
  const [airplaneMode, setAirplaneMode] = useAirplaneMode();
  const [wifiEnabled, setWifiEnabled] = useWifiEnabled();
  const [cellular, setCellular] = useCellularEnabled();
  const [bluetooth, setBluetooth] = useBluetoothEnabled();
  const [nearby, setNearby] = useNearbyEnabled();
  const [hotspot, setHotspot] = useHotspotEnabled();
  const [rotationLock, setRotationLock] = useRotationLock();
  const [lowPower, setLowPower] = useLowPowerMode();
  const [flashlight, setFlashlight] = useFlashlight();
  const [brightness, setBrightness] = useBrightness();
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

  const isDark = settings.theme.value === 'taso-dark';
  const toggleTheme = () =>
    setSettings((prev) => ({
      ...prev,
      theme: isDark ? { label: 'Light', value: 'default-light' } : { label: 'Dark', value: 'taso-dark' },
    }));

  const go = (path: string) => {
    setIsOpen(false);
    history.push(path);
  };

  const dragProps = {
    onMouseDown: (e: React.MouseEvent) => startDrag(e.clientY),
    onTouchStart: (e: React.TouchEvent) => startDrag(e.touches[0].clientY),
    style: {
      transform: `translateY(${dragY}px)`,
      transition: dragging ? 'none' : 'transform 200ms',
    },
  };

  if (mode === 'notifications') {
    return (
      <>
        <div className="absolute inset-0 z-[70] bg-black/40" onClick={() => setIsOpen(false)} />
        <div
          className="liquid-glass liquid-glass-dark absolute left-0 right-0 top-0 z-[71] max-h-full overflow-y-auto rounded-b-[32px] border-t-0 px-4 pb-6 pt-12"
          {...dragProps}
        >
          <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-white/40" />
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-semibold text-white/80">Notifications</span>
            {unreadIds.length > 0 && (
              <button className="text-sm font-medium text-blue-400" onClick={() => markAllAsRead()}>
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {unreadIds.length === 0 && (
              <div className="py-8 text-center text-sm text-white/50">No Notifications</div>
            )}
            {unreadIds.map((id) => (
              <NotificationCard key={id} id={id} />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cc-backdrop absolute inset-0 z-[70]" onClick={() => setIsOpen(false)} />
      <div
        className="absolute inset-0 z-[71] flex flex-col px-4 pb-5 pt-11 text-white"
        {...dragProps}
      >
        <div className="mb-2 flex items-center justify-between">
          <CircleToggle
            icon={<SettingsGlyph size={19} />}
            label="Settings"
            size="sm"
            onClick={() => go('/settings')}
          />
          <CircleToggle
            icon={<Power size={19} />}
            label="Lock"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setLocked(true);
            }}
          />
        </div>

        <div className="mb-3 flex items-center justify-between px-1 text-[13px] font-semibold text-white/70">
          <span className="flex items-center gap-1.5">
            {airplaneMode ? 'Airplane Mode' : cellular ? 'iFruit · LTE' : 'No Service'}
          </span>
          <span className="flex items-center gap-1.5">
            {doNotDisturb && <Moon size={12} fill="currentColor" />}
            {lowPower ? 'Low Power' : '100%'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5" style={{ gridAutoRows: '82px' }}>
          {/* Connectivity module */}
          <div className="cc-module col-span-2 row-span-2 grid grid-cols-2 place-items-center rounded-[26px] p-2">
            <CircleToggle
              icon={<Plane size={24} />}
              label="Airplane Mode"
              active={airplaneMode}
              tone="red"
              onClick={() => setAirplaneMode((v) => !v)}
            />
            <CircleToggle
              icon={<Signal size={20} />}
              label="Cellular Data"
              active={cellular && !airplaneMode}
              tone="green"
              onClick={() => setCellular((v) => !v)}
            />
            <CircleToggle
              icon={<WifiGlyph className="h-[17px] w-[23px]" />}
              label="Wi-Fi"
              active={wifiEnabled && !airplaneMode}
              tone="blue"
              onClick={() => setWifiEnabled((v) => !v)}
            />
            <CircleToggle
              icon={<Bluetooth size={20} />}
              label="Bluetooth"
              active={bluetooth && !airplaneMode}
              tone="blue"
              onClick={() => setBluetooth((v) => !v)}
            />
          </div>

          {/* Now Playing */}
          <div className="cc-module col-span-2 row-span-2 flex flex-col justify-between rounded-[26px] p-3">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-[10px] bg-white/25" />
              <span className="cc-circle-off flex h-7 w-7 items-center justify-center rounded-full">
                <Cast size={14} />
              </span>
            </div>
            <div className="text-[15px] font-semibold">Not Playing</div>
            <div className="flex items-center justify-between px-2 text-[#0a84ff]">
              <SkipBack size={22} fill="currentColor" />
              <Play size={24} fill="currentColor" strokeWidth={0} />
              <SkipForward size={22} fill="currentColor" />
            </div>
          </div>

          {/* Rotation lock + flashlight, then Do Not Disturb underneath */}
          <div className="flex items-center justify-center">
            <CircleToggle
              icon={<Lock size={22} />}
              label="Rotation Lock"
              size="lg"
              variant="glass"
              active={rotationLock}
              tone="white"
              onClick={() => setRotationLock((v) => !v)}
            />
          </div>
          <div className="flex items-center justify-center">
            <CircleToggle
              icon={<Flashlight size={22} />}
              label="Flashlight"
              size="lg"
              variant="glass"
              active={flashlight}
              tone="white"
              onClick={() => setFlashlight((v) => !v)}
            />
          </div>

          <div className="row-span-2">
            <GlassSlider
              value={brightness}
              onChange={setBrightness}
              label="Brightness"
              icon={<SunMedium size={24} className="text-[#ffb020]" />}
            />
          </div>
          <div className="row-span-2">
            {/* Commit-only: every settings write re-sends the whole settings
                object over NUI, so don't do it on each drag frame. */}
            <GlassSlider
              value={settings.callVolume}
              onCommit={(v) => setSettings((prev) => ({ ...prev, callVolume: v }))}
              label="Volume"
              icon={<Volume2 size={24} className="text-[#0a84ff]" />}
            />
          </div>

          <button
            type="button"
            onClick={() => setDoNotDisturb((v) => !v)}
            className="cc-module col-span-2 flex items-center gap-2.5 rounded-[26px] px-3 text-left"
          >
            <span
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${
                doNotDisturb ? 'bg-white text-[#5e5ce6]' : 'cc-circle-off text-white'
              }`}
            >
              <Moon size={20} fill="currentColor" strokeWidth={0} />
            </span>
            <span className="flex-1 text-[15px] font-semibold leading-[1.15]">Do Not Disturb</span>
            <ChevronsUpDown size={15} className="shrink-0 text-white/60" />
          </button>
        </div>

        {/* Extra controls, on their own darker shelf like the second page of
            controls on a real phone. */}
        <div className="cc-shelf mt-3 rounded-[30px] p-3">
          <div className="grid grid-cols-4 place-items-center gap-y-3">
            <CircleToggle
              icon={<BatteryLow size={20} />}
              label="Low Power Mode"
              active={lowPower}
              tone="yellow"
              onClick={() => setLowPower((v) => !v)}
            />
            <CircleToggle
              icon={<Contrast size={20} />}
              label="Appearance"
              active={!isDark}
              tone="white"
              onClick={toggleTheme}
            />
            <CircleToggle
              icon={<Share2 size={19} />}
              label="Nearby Share"
              active={nearby}
              tone="blue"
              onClick={() => setNearby((v) => !v)}
            />
            <CircleToggle
              icon={<Radio size={19} />}
              label="Personal Hotspot"
              active={hotspot}
              tone="green"
              onClick={() => setHotspot((v) => !v)}
            />
            <CircleToggle icon={<Timer size={20} />} label="Timer" onClick={() => go('/clock/timer')} />
            <CircleToggle icon={<Camera size={20} />} label="Camera" onClick={() => go('/camera')} />
            <CircleToggle
              icon={<Calculator size={20} />}
              label="Calculator"
              onClick={() => go('/calculator')}
            />
            <CircleToggle
              icon={<Mic size={20} />}
              label="Voice Memos"
              onClick={() => go('/voicememos')}
            />
          </div>
        </div>
      </div>
    </>
  );
};
