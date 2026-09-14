import { atom, useRecoilState } from 'recoil';

export type ControlCenterMode = 'full' | 'notifications';

export const controlCenterState = {
  isOpen: atom<boolean>({
    key: 'controlCenterIsOpen',
    default: false,
  }),
  mode: atom<ControlCenterMode>({
    key: 'controlCenterMode',
    default: 'full',
  }),
  doNotDisturb: atom<boolean>({
    key: 'controlCenterDoNotDisturb',
    default: false,
  }),
  airplaneMode: atom<boolean>({
    key: 'controlCenterAirplaneMode',
    default: false,
  }),
  wifiEnabled: atom<boolean>({
    key: 'controlCenterWifiEnabled',
    default: true,
  }),
  cellularEnabled: atom<boolean>({
    key: 'controlCenterCellularEnabled',
    default: true,
  }),
  bluetoothEnabled: atom<boolean>({
    key: 'controlCenterBluetoothEnabled',
    default: true,
  }),
  nearbyEnabled: atom<boolean>({
    key: 'controlCenterNearbyEnabled',
    default: false,
  }),
  hotspotEnabled: atom<boolean>({
    key: 'controlCenterHotspotEnabled',
    default: false,
  }),
  rotationLock: atom<boolean>({
    key: 'controlCenterRotationLock',
    default: false,
  }),
  screenMirroring: atom<boolean>({
    key: 'controlCenterScreenMirroring',
    default: false,
  }),
  lowPowerMode: atom<boolean>({
    key: 'controlCenterLowPowerMode',
    default: false,
  }),
  flashlight: atom<boolean>({
    key: 'controlCenterFlashlight',
    default: false,
  }),
  /** 0-100. Drives the dimming overlay in BrightnessOverlay. */
  brightness: atom<number>({
    key: 'controlCenterBrightness',
    default: 100,
  }),
};

export const useControlCenterOpen = () => useRecoilState(controlCenterState.isOpen);
export const useControlCenterMode = () => useRecoilState(controlCenterState.mode);
export const useDoNotDisturb = () => useRecoilState(controlCenterState.doNotDisturb);
export const useAirplaneMode = () => useRecoilState(controlCenterState.airplaneMode);
export const useWifiEnabled = () => useRecoilState(controlCenterState.wifiEnabled);
export const useCellularEnabled = () => useRecoilState(controlCenterState.cellularEnabled);
export const useBluetoothEnabled = () => useRecoilState(controlCenterState.bluetoothEnabled);
export const useNearbyEnabled = () => useRecoilState(controlCenterState.nearbyEnabled);
export const useHotspotEnabled = () => useRecoilState(controlCenterState.hotspotEnabled);
export const useRotationLock = () => useRecoilState(controlCenterState.rotationLock);
export const useScreenMirroring = () => useRecoilState(controlCenterState.screenMirroring);
export const useLowPowerMode = () => useRecoilState(controlCenterState.lowPowerMode);
export const useFlashlight = () => useRecoilState(controlCenterState.flashlight);
export const useBrightness = () => useRecoilState(controlCenterState.brightness);
