import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useNuiEvent } from '@common/hooks/useNuiEvent';
import { WalletEvents } from '@typings/wallet';
import { useWalletOverview } from './hooks/useWalletOverview';
import { WalletHome } from './components/WalletHome';
import { WalletPay } from './components/WalletPay';
import { WalletHistory } from './components/WalletHistory';
import { WalletHelp } from './components/WalletHelp';
import { WalletTabBar } from './components/WalletTabBar';
import './wallet.css';

export const WalletApp: React.FC = () => {
  const { refresh } = useWalletOverview();

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Any new transaction means the balance moved too, so re-pull the overview.
  useNuiEvent('WALLET', WalletEvents.TRANSACTION_ADDED, refresh);

  return (
    <AppWrapper id="wallet-app" className="buckme-app" fullBleed>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/wallet/pay" component={WalletPay} />
          <Route path="/wallet/history" component={WalletHistory} />
          <Route path="/wallet/help" component={WalletHelp} />
          <Route path="/wallet" component={WalletHome} />
        </Switch>
      </React.Suspense>
      <WalletTabBar />
    </AppWrapper>
  );
};
