import React from 'react';
import { SvgIconProps } from '@mui/material';
import buckmeLogo from '@apps/wallet/assets/buckme-logo.png';

const WalletAppIcon = (props: SvgIconProps) => (
  <div
    className={props.className}
    style={{
      borderRadius: 18,
      background: 'linear-gradient(45deg, #7c4fd6 20%, #a77af5 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img src={buckmeLogo} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
  </div>
);

export default WalletAppIcon;
