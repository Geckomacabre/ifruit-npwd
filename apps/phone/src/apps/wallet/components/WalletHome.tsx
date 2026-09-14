import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useWalletOverview } from '../hooks/useWalletOverview';
import { formatMoney } from '../utils/format';
import { BuckCard } from './BuckCard';
import { TransactionList } from './TransactionList';
import buckmeLogo from '../assets/buckme-logo.png';

export const WalletHome: React.FC = () => {
  const history = useHistory();
  const { overview } = useWalletOverview();
  const [balanceHidden, setBalanceHidden] = useState(false);

  if (!overview) return <LoadingSpinner />;

  return (
    <div className="buckme-screen">
      <header className="buckme-brand">
        <img src={buckmeLogo} alt="BuckMe" />
        <span>BuckMe</span>
      </header>

      <BuckCard
        name={overview.cardholderName}
        last4={overview.cardLast4}
        cvv={overview.cardCvv}
      />

      <button
        type="button"
        className="buckme-balance"
        onClick={() => setBalanceHidden((hidden) => !hidden)}
      >
        <span className="buckme-balance-label">Balance</span>
        <span className="buckme-balance-amount">
          {balanceHidden ? '••••••' : formatMoney(overview.balance)}
        </span>
      </button>

      <button type="button" className="buckme-button" onClick={() => history.push('/wallet/pay')}>
        Send money
      </button>

      <div className="buckme-section-title">
        <span>Recent activity</span>
        <button type="button" onClick={() => history.push('/wallet/history')}>
          See all
        </button>
      </div>
      <TransactionList transactions={overview.recentTransactions} />
    </div>
  );
};
