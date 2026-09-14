import { WalletEvents, WalletTransaction } from '@typings/wallet';
import { NotificationEvents } from '@typings/notifications';
import { RegisterNuiProxy } from './cl_utils';
import { sendMessage } from '../utils/messages';

RegisterNuiProxy(WalletEvents.FETCH_OVERVIEW);
RegisterNuiProxy(WalletEvents.FETCH_TRANSACTIONS);
RegisterNuiProxy(WalletEvents.CHECK_NUMBER);
RegisterNuiProxy(WalletEvents.SEND_PAYMENT);

onNet(WalletEvents.TRANSACTION_ADDED, (transaction: WalletTransaction) => {
  sendMessage('WALLET', WalletEvents.TRANSACTION_ADDED, transaction);

  const sign = transaction.amount < 0 ? '-' : '+';
  sendMessage('PHONE', NotificationEvents.CREATE_NOTIFICATION, {
    appId: 'WALLET',
    notisId: `npwd:wallet:${transaction.id}`,
    secondaryTitle: transaction.company,
    content: `${sign}$${Math.abs(transaction.amount).toLocaleString('en-US')}`,
    keepOpen: false,
    duration: 3000,
    path: '/wallet',
  });
});
