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
  MonitorSmartphone,
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
  X,
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
  useScreenMirroring,
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
import { LockClock, LockControls, LockWidgets } from '@os/lockscreen/components/LockFace';
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
  const [screenMirroring, setScreenMirroring] = useScreenMirroring();
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
        <div
          className="absolute inset-0 z-[70] bg-black/35 backdrop-blur-xl"
          onClick={() => setIsOpen(false)}
        />
        {/* Same surface as the lock screen, which is what it is on iOS -- the
            clock stays put and the notification list expands underneath it. */}
        <div className="absolute inset-0 z-[71] flex flex-col pb-6 pt-12 text-white" {...dragProps}>
          <LockClock />

          <div className="mb-2 mt-4 flex items-center justify-between px-6">
            <h2 className="text-[27px] font-normal drop-shadow">Notification Center</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="lock-control flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full"
            >
              <X size={21} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-6">
            {unreadIds.length === 0 && (
              <div className="py-10 text-center text-sm text-white/60">No Notifications</div>
            )}
            {unreadIds.map((id) => (
              <NotificationCard key={id} id={id} />
            ))}
            {unreadIds.length > 0 && (
              <button
                className="lock-control mt-1 self-center rounded-full px-4 py-1.5 text-[13px] font-semibold"
                onClick={() => markAllAsRead()}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="mt-3">
            <LockWidgets />
            <div className="mt-4">
              <LockControls onCamera={() => go('/camera')} />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cc-backdrop absolute inset-0 z-[70]" onClick={() => setIsOpen(false)} />
      {/* Geometry is measured off the reference rather than eyeballed. On the
          400x800 screen: 48px side margins (12% of width), two 140px modules
          with a 20px gutter, 56px controls inside them, 61px standalone
          circles, 64px sliders, and a shelf that sits WIDER than the modules
          above it -- that inset is most of why earlier passes read wrong even
          when the individual parts were right. */}
      <div
        className="absolute inset-0 z-[71] flex flex-col text-white"
        {...dragProps}
        style={{ ...dragProps.style, padding: '18px 48px 20px' }}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Settings"
            onClick={() => go('/settings')}
            className="cc-circle-glass flex h-[30px] w-[30px] items-center justify-center rounded-full text-white"
          >
            <SettingsGlyph size={17} />
          </button>
          <button
            type="button"
            aria-label="Lock"
            onClick={() => {
              setIsOpen(false);
              setLocked(true);
            }}
            className="cc-circle-glass flex h-[30px] w-[30px] items-center justify-center rounded-full text-white"
          >
            <Power size={17} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-[15px] font-semibold text-white/90">
          <span className="flex items-center gap-1.5">
            {airplaneMode ? 'Airplane Mode' : cellular ? 'iFruit \u00b7 LTE' : 'No Service'}
          </span>
          <span className="flex items-center gap-1.5">
            {doNotDisturb && <Moon size={13} fill="currentColor" strokeWidth={0} />}
            {lowPower ? 'Low Power' : '100%'}
          </span>
        </div>

        <div className="mt-3.5 flex gap-5">
          {/* Connectivity: three large controls plus the secondary radios in a
              cluster, the way iOS lays out the expanded module. */}
          <div
            className="cc-module grid shrink-0 grid-cols-2 place-items-center rounded-[28px]"
            style={{ width: 140, height: 140 }}
          >
            <CircleToggle
              icon={<Plane size={24} />}
              label="Airplane Mode"
              active={airplaneMode}
              tone="red"
              onClick={() => setAirplaneMode((v) => !v)}
            />
            <CircleToggle
              icon={<Share2 size={22} />}
              label="Nearby Share"
              active={nearby}
              tone="blue"
              onClick={() => setNearby((v) => !v)}
            />
            <CircleToggle
              icon={<WifiGlyph className="h-[19px] w-[26px]" />}
              label="Wi-Fi"
              active={wifiEnabled && !airplaneMode}
              tone="blue"
              onClick={() => setWifiEnabled((v) => !v)}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <CircleToggle
                icon={<Signal size={13} />}
                label="Cellular Data"
                size="sm"
                active={cellular && !airplaneMode}
                tone="green"
                onClick={() => setCellular((v) => !v)}
              />
              <CircleToggle
                icon={<Bluetooth size={13} />}
                label="Bluetooth"
                size="sm"
                active={bluetooth && !airplaneMode}
                tone="blue"
                onClick={() => setBluetooth((v) => !v)}
              />
              <CircleToggle
                icon={<Radio size={13} />}
                label="Personal Hotspot"
                size="sm"
                active={hotspot}
                tone="green"
                onClick={() => setHotspot((v) => !v)}
              />
              <CircleToggle
                icon={<MonitorSmartphone size={13} />}
                label="Screen Mirroring"
                size="sm"
                active={screenMirroring}
                tone="blue"
                onClick={() => setScreenMirroring((v) => !v)}
              />
            </div>
          </div>

          {/* Now Playing */}
          <div
            className="cc-module flex flex-1 flex-col justify-between rounded-[28px] p-3"
            style={{ height: 140 }}
          >
            <div className="flex items-start justify-between">
              <div className="h-[46px] w-[46px] rounded-[10px] bg-white/25" />
              <span className="cc-circle-off flex h-7 w-7 items-center justify-center rounded-full">
                <Cast size={14} />
              </span>
            </div>
            <div className="text-[17px] font-semibold">Not Playing</div>
            <div className="flex items-center justify-between px-1.5 text-[#0a84ff]">
              <SkipBack size={22} fill="currentColor" />
              <Play size={24} fill="currentColor" strokeWidth={0} />
              <SkipForward size={22} fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-5">
          <div className="flex shrink-0 flex-col justify-between" style={{ width: 140, height: 142 }}>
            <div className="flex justify-between">
              <CircleToggle
                icon={<Lock size={23} />}
                label="Rotation Lock"
                size="lg"
                variant="glass"
                active={rotationLock}
                tone="white"
                onClick={() => setRotationLock((v) => !v)}
              />
              <CircleToggle
                icon={<Flashlight size={23} />}
                label="Flashlight"
                size="lg"
                variant="glass"
                active={flashlight}
                tone="white"
                onClick={() => setFlashlight((v) => !v)}
              />
            </div>

            <button
              type="button"
              onClick={() => setDoNotDisturb((v) => !v)}
              className="cc-module flex items-center gap-2 rounded-[31px] px-2 text-left"
              style={{ height: 62 }}
            >
              <span
                className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full ${
                  doNotDisturb ? 'bg-white text-[#5e5ce6]' : 'cc-circle-off text-white'
                }`}
              >
                <Moon size={22} fill="currentColor" strokeWidth={0} />
              </span>
              <span className="flex-1 text-[15px] font-semibold leading-[1.1]">Do Not Disturb</span>
              <ChevronsUpDown size={15} className="shrink-0 text-white/60" />
            </button>
          </div>

          <div className="flex flex-1 gap-4">
            <div className="flex-1" style={{ height: 142 }}>
              <GlassSlider
                value={brightness}
                onChange={setBrightness}
                label="Brightness"
                icon={<SunMedium size={26} className="text-[#ffb020]" />}
              />
            </div>
            <div className="flex-1" style={{ height: 142 }}>
              {/* Commit-only: every settings write re-sends the whole settings
                  object over NUI, so don't do it on each drag frame. */}
              <GlassSlider
                value={settings.callVolume}
                onCommit={(v) => setSettings((prev) => ({ ...prev, callVolume: v }))}
                label="Volume"
                icon={<Volume2 size={26} className="text-[#0a84ff]" />}
              />
            </div>
          </div>
        </div>

        {/* Extra controls. Sits wider than the modules above, as in the
            reference, so it reads as its own page of controls. */}
        <div className="cc-shelf mt-4 rounded-[30px] px-3 py-4" style={{ marginLeft: -14, marginRight: -14 }}>
          <div className="grid grid-cols-4 place-items-center gap-y-4">
            <CircleToggle
              icon={<BatteryLow size={24} />}
              label="Low Power Mode"
              active={lowPower}
              tone="yellow"
              onClick={() => setLowPower((v) => !v)}
            />
            <CircleToggle
              icon={<Contrast size={24} />}
              label="Appearance"
              active={!isDark}
              tone="white"
              onClick={toggleTheme}
            />
            <CircleToggle
              icon={<Share2 size={23} />}
              label="Nearby Share"
              active={nearby}
              tone="blue"
              onClick={() => setNearby((v) => !v)}
            />
            <CircleToggle
              icon={<Radio size={23} />}
              label="Personal Hotspot"
              active={hotspot}
              tone="green"
              onClick={() => setHotspot((v) => !v)}
            />
            <CircleToggle icon={<Timer size={24} />} label="Timer" onClick={() => go('/clock/timer')} />
            <CircleToggle icon={<Camera size={24} />} label="Camera" onClick={() => go('/camera')} />
            <CircleToggle
              icon={<Calculator size={24} />}
              label="Calculator"
              onClick={() => go('/calculator')}
            />
            <CircleToggle
              icon={<Mic size={24} />}
              label="Voice Memos"
              onClick={() => go('/voicememos')}
            />
          </div>
        </div>
      </div>
    </>
  );
};
