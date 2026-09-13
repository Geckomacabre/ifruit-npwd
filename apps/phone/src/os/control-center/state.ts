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
};

export const useControlCenterOpen = () => useRecoilState(controlCenterState.isOpen);
export const useControlCenterMode = () => useRecoilState(controlCenterState.mode);
export const useDoNotDisturb = () => useRecoilState(controlCenterState.doNotDisturb);
export const useAirplaneMode = () => useRecoilState(controlCenterState.airplaneMode);
export const useWifiEnabled = () => useRecoilState(controlCenterState.wifiEnabled);
