import React from 'react';
import buckmeLogo from '@apps/wallet/assets/buckme-logo.png';

const WalletIcon: React.FC = () => (
  <img src={buckmeLogo} alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
);

export default WalletIcon;
