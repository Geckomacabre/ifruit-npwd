export interface WalletTransaction {
  id: number;
  amount: number;
  company: string;
  logo: string | null;
  timestamp: number;
}

export interface WalletOverview {
  balance: number;
  cardholderName: string;
  cardLast4: string;
  cardCvv: string;
  recentTransactions: WalletTransaction[];
}

export interface WalletFetchTransactionsDTO {
  page: number;
}

export interface WalletCheckNumberDTO {
  number: string;
}

export interface WalletCheckNumberResp {
  name: string | null;
}

export interface WalletSendPaymentDTO {
  number: string;
  amount: number;
}

export interface WalletSendPaymentResp {
  balance: number;
}

export type WalletError =
  | 'INVALID_AMOUNT'
  | 'INSUFFICIENT_FUNDS'
  | 'NUMBER_NOT_FOUND'
  | 'SELF_TRANSFER'
  | 'RECIPIENT_OFFLINE'
  | 'TRANSFER_FAILED'
  | 'BUSY';

export const WALLET_PAGE_SIZE = 25;
export const WALLET_RECENT_COUNT = 5;
export const WALLET_MAX_TRANSFER = 1000000;

export enum WalletEvents {
  FETCH_OVERVIEW = 'npwd:wallet:fetchOverview',
  FETCH_TRANSACTIONS = 'npwd:wallet:fetchTransactions',
  CHECK_NUMBER = 'npwd:wallet:checkNumber',
  SEND_PAYMENT = 'npwd:wallet:sendPayment',
  TRANSACTION_ADDED = 'npwd:wallet:transactionAdded',
}
