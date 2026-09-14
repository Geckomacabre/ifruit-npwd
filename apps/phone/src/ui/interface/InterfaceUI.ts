import { CSSProperties } from 'react';

export interface AppContentTypes {
  children?: JSX.Element | JSX.Element[];
  paperStyle?: CSSProperties;
  disableSuspenseHandler?: boolean;
  backdrop?: boolean;
  onClickBackdrop?: (...args: any[]) => void;
}

export interface AppWrapperTypes extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  id?: string;
  style?: CSSProperties;
  handleClickAway?: (...args: any[]) => void;
  /** Skip the status-bar spacing and background; the app draws under the status bar itself. */
  fullBleed?: boolean;
}
