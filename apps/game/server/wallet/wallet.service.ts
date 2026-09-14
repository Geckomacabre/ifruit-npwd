import {
  WALLET_MAX_TRANSFER,
  WALLET_PAGE_SIZE,
  WALLET_RECENT_COUNT,
  WalletCheckNumberDTO,
  WalletCheckNumberResp,
  WalletError,
  WalletEvents,
  WalletFetchTransactionsDTO,
  WalletOverview,
  WalletSendPaymentDTO,
  WalletSendPaymentResp,
  WalletTransaction,
} from '@typings/wallet';
import PlayerService from '../players/player.service';
import { Player } from '../players/player.class';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { WalletDB, _WalletDB } from './wallet.database';
import { deterministicDigits, walletLogger } from './wallet.utils';
import { addBankMoney, getBankBalance, removeBankMoney } from './wallet.money';

class _WalletService {
  private readonly walletDB: _WalletDB;
  // Sources with a payment in flight. The balance check and the withdrawal are
  // separate framework calls, so two quick taps could otherwise both pass.
  private readonly sending = new Set<number>();

  constructor() {
    this.walletDB = WalletDB;
    walletLogger.debug('Wallet service started');
  }

  async handleFetchOverview(reqObj: PromiseRequest<void>, resp: PromiseEventResp<WalletOverview>) {
    const player = PlayerService.getPlayer(reqObj.source);
    const identifier = player.getIdentifier();

    try {
      const recentTransactions = await this.walletDB.fetchTransactions(
        identifier,
        WALLET_RECENT_COUNT,
        0,
      );

      resp({
        status: 'ok',
        data: {
          balance: getBankBalance(reqObj.source),
          cardholderName: (player.getName() ?? player.username ?? '').toUpperCase(),
          cardLast4: deterministicDigits(`${identifier}:card`, 4),
          cardCvv: deterministicDigits(`${identifier}:cvv`, 3),
          recentTransactions,
        },
      });
    } catch (e) {
      walletLogger.error(`Error in handleFetchOverview, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleFetchTransactions(
    reqObj: PromiseRequest<WalletFetchTransactionsDTO>,
    resp: PromiseEventResp<WalletTransaction[]>,
  ) {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    const page = Math.max(0, Math.trunc(Number(reqObj.data?.page) || 0));

    try {
      const transactions = await this.walletDB.fetchTransactions(
        identifier,
        WALLET_PAGE_SIZE,
        page * WALLET_PAGE_SIZE,
      );
      resp({ status: 'ok', data: transactions });
    } catch (e) {
      walletLogger.error(`Error in handleFetchTransactions, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleCheckNumber(
    reqObj: PromiseRequest<WalletCheckNumberDTO>,
    resp: PromiseEventResp<WalletCheckNumberResp>,
  ) {
    const { player, error } = await this.resolveRecipient(reqObj.source, reqObj.data?.number);
    if (error) return resp({ status: 'error', errorMsg: error });

    resp({ status: 'ok', data: { name: player.getName() } });
  }

  async handleSendPayment(
    reqObj: PromiseRequest<WalletSendPaymentDTO>,
    resp: PromiseEventResp<WalletSendPaymentResp>,
  ) {
    const src = reqObj.source;
    const amount = Math.floor(Number(reqObj.data?.amount));
    const fail = (errorMsg: WalletError) => resp({ status: 'error', errorMsg });

    if (!Number.isFinite(amount) || amount <= 0 || amount > WALLET_MAX_TRANSFER) {
      return fail('INVALID_AMOUNT');
    }

    if (this.sending.has(src)) return fail('BUSY');
    this.sending.add(src);

    try {
      const { player: recipient, error } = await this.resolveRecipient(src, reqObj.data?.number);
      if (error) return fail(error);

      if (getBankBalance(src) < amount || !removeBankMoney(src, amount, 'BuckMe payment')) {
        return fail('INSUFFICIENT_FUNDS');
      }

      if (!addBankMoney(recipient.source, amount, 'BuckMe payment')) {
        addBankMoney(src, amount, 'BuckMe refund');
        return fail('TRANSFER_FAILED');
      }

      const sender = PlayerService.getPlayer(src);

      // The money has already moved; a failed history write must not report
      // the payment itself as failed.
      try {
        await this.addTransaction(
          sender.getIdentifier(),
          -amount,
          recipient.getName() ?? recipient.getPhoneNumber(),
        );
        await this.addTransaction(
          recipient.getIdentifier(),
          amount,
          sender.getName() ?? sender.getPhoneNumber(),
        );
      } catch (e) {
        walletLogger.error(`Payment of ${amount} from ${src} succeeded but was not logged, ${e.message}`);
      }

      resp({ status: 'ok', data: { balance: getBankBalance(src) } });
    } finally {
      this.sending.delete(src);
    }
  }

  /**
   * Records a transaction and pushes it to the owner's phone if they are online.
   * Exported as addWalletTransaction, lb-phone's AddTransaction equivalent.
   */
  async addTransaction(
    identifier: string,
    amount: number,
    title: string,
    logo: string | null = null,
  ): Promise<WalletTransaction> {
    const company = title.length > 50 ? `${title.slice(0, 47)}...` : title;
    const transaction = await this.walletDB.addTransaction(identifier, amount, company, logo);

    const owner = PlayerService.getPlayerFromIdentifier(identifier);
    if (owner) emitNet(WalletEvents.TRANSACTION_ADDED, owner.source, transaction);

    return transaction;
  }

  // Payments only go to players who are in the city: qbx's offline AddMoney
  // edits PlayerData without saving it, so offline transfers would vanish.
  private async resolveRecipient(
    src: number,
    number: unknown,
  ): Promise<{ player?: Player; error?: WalletError }> {
    if (typeof number !== 'string' || !number.trim()) return { error: 'NUMBER_NOT_FOUND' };

    const identifier = await PlayerService.getIdentifierFromPhoneNumber(number.trim(), true);
    if (!identifier) return { error: 'NUMBER_NOT_FOUND' };
    if (identifier === PlayerService.getIdentifier(src)) return { error: 'SELF_TRANSFER' };

    const player = PlayerService.getPlayerFromIdentifier(identifier);
    if (!player) return { error: 'RECIPIENT_OFFLINE' };

    return { player };
  }
}

const WalletService = new _WalletService();
export default WalletService;
