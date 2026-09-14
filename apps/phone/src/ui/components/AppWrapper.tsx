import React from 'react';
import { AppWrapperTypes } from '../interface/InterfaceUI';

// Height of the iFruit status bar (clock/notch row, see StatusBar.tsx).
const STATUS_BAR_HEIGHT = 44;

export const AppWrapper: React.FC<AppWrapperTypes> = ({
  children,
  style,
  handleClickAway,
  fullBleed,
  className,
  ...props
}) => {
  // By default an app starts below the status bar, on its own theme background
  // so no black band shows above it. fullBleed apps (home screen, apps that
  // paint behind the status bar) handle that spacing themselves.
  return (
    <div
      {...props}
      className={
        fullBleed ? className : ['bg-neutral-100 dark:bg-neutral-900', className].filter(Boolean).join(' ')
      }
      style={{
        padding: 0,
        // After the padding shorthand, or it would reset this back to 0.
        paddingTop: fullBleed ? 0 : STATUS_BAR_HEIGHT,
        margin: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        minHeight: '720px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
