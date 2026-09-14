import {
  WalletCheckNumberDTO,
  WalletCheckNumberResp,
  WalletEvents,
  WalletFetchTransactionsDTO,
  WalletOverview,
  WalletSendPaymentDTO,
  WalletSendPaymentResp,
  WalletTransaction,
} from '@typings/wallet';
import WalletService from './wallet.service';
import { WalletDB } from './wallet.database';
import { walletLogger } from './wallet.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

WalletDB.ensureTable().catch((e) =>
  walletLogger.error(`Could not create npwd_wallet_transactions, Error: ${e.message}`),
);

onNetPromise<void, WalletOverview>(WalletEvents.FETCH_OVERVIEW, (reqObj, resp) => {
  WalletService.handleFetchOverview(reqObj, resp).catch((e) => {
    walletLogger.error(`Error occurred in fetch overview event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<WalletFetchTransactionsDTO, WalletTransaction[]>(
  WalletEvents.FETCH_TRANSACTIONS,
  (reqObj, resp) => {
    WalletService.handleFetchTransactions(reqObj, resp).catch((e) => {
      walletLogger.error(
        `Error occurred in fetch transactions event (${reqObj.source}), Error: ${e.message}`,
      );
      resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
    });
  },
);

onNetPromise<WalletCheckNumberDTO, WalletCheckNumberResp>(
  WalletEvents.CHECK_NUMBER,
  (reqObj, resp) => {
    WalletService.handleCheckNumber(reqObj, resp).catch((e) => {
      walletLogger.error(`Error occurred in check number event (${reqObj.source}), Error: ${e.message}`);
      resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
    });
  },
);

onNetPromise<WalletSendPaymentDTO, WalletSendPaymentResp>(
  WalletEvents.SEND_PAYMENT,
  (reqObj, resp) => {
    WalletService.handleSendPayment(reqObj, resp).catch((e) => {
      walletLogger.error(`Error occurred in send payment event (${reqObj.source}), Error: ${e.message}`);
      resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
    });
  },
);

// exports.npwd:addWalletTransaction(citizenid, amount, title, logo?) -- negative
// amount for money out. Only logs history; moving the money is the caller's job.
global.exports(
  'addWalletTransaction',
  (identifier: string, amount: number, title: string, logo?: string) =>
    WalletService.addTransaction(identifier, amount, title, logo ?? null),
);
