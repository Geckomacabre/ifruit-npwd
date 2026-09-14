import React from 'react';
import { SvgIconProps } from '@mui/material';
import buckmeLogo from '@apps/wallet/assets/buckme-logo.png';

// Every other icon (generated or real artwork) is clipped to
// squircle-mask.png -- the real icon pack's own alpha shape -- via an SVG
// mask, so its margin and corner curvature match exactly. This one filled
// its whole container edge-to-edge with a plain CSS border-radius and a CSS
// mask-image on a <div>, which several Chromium builds render unreliably;
// the SVG mask below is the same technique liquidGlass.tsx uses.
const WalletAppIcon = (props: SvgIconProps) => (
  <svg
    viewBox="0 0 100 100"
    className={props.className}
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
  >
    <defs>
      <mask id="wallet-mask" x="0" y="0" width="100" height="100" maskUnits="userSpaceOnUse">
        <image
          href="media/icons/squircle-mask.png"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="none"
        />
      </mask>
      <linearGradient id="wallet-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0.2" stopColor="#7c4fd6" />
        <stop offset="0.9" stopColor="#a77af5" />
      </linearGradient>
    </defs>
    <g mask="url(#wallet-mask)">
      <rect width="100" height="100" fill="url(#wallet-bg)" />
      <image href={buckmeLogo} x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet" />
    </g>
  </svg>
);

export default WalletAppIcon;
