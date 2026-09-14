import {
  CryptoError,
  CryptoHolding,
  CryptoPortfolio,
  CryptoTradeDTO,
} from '@typings/crypto';
import PlayerService from '../players/player.service';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { CryptoDB, _CryptoDB } from './crypto.database';
import { getCoins, getPrice } from './crypto.market';
import { addBankMoney, getBankBalance, removeBankMoney } from '../wallet/wallet.money';
import { cryptoLogger } from './crypto.utils';

const TRADE_LIMIT = 40;
/** Below this a position is dust; selling out should leave nothing behind. */
const DUST = 1e-8;

class _CryptoService {
  private readonly cryptoDB: _CryptoDB;

  constructor() {
    this.cryptoDB = CryptoDB;
  }

  private async buildPortfolio(src: number, identifier: string): Promise<CryptoPortfolio> {
    const coins = getCoins();
    const [holdingRows, tradeRows] = await Promise.all([
      this.cryptoDB.getHoldings(identifier),
      this.cryptoDB.getTrades(identifier, TRADE_LIMIT),
    ]);

    const holdings: CryptoHolding[] = holdingRows.map((row) => {
      const amount = Number(row.amount);
      const price = getPrice(row.symbol) ?? 0;
      return {
        symbol: row.symbol,
        amount,
        value: Number((amount * price).toFixed(2)),
        costBasis: Number(row.cost_basis),
      };
    });

    return {
      bankBalance: getBankBalance(src),
      coins,
      holdings,
      trades: tradeRows.map((row) => ({
        id: row.id,
        symbol: row.symbol,
        side: row.side,
        amount: Number(row.amount),
        price: Number(row.price),
        total: Number(row.total),
        createdAt: Number(row.createdAt),
      })),
      totalValue: Number(holdings.reduce((sum, h) => sum + h.value, 0).toFixed(2)),
    };
  }

  async handleFetch(
    reqObj: PromiseRequest<void>,
    resp: PromiseEventResp<CryptoPortfolio>,
  ): Promise<void> {
    const identifier = PlayerService.getIdentifier(reqObj.source);
    resp({ status: 'ok', data: await this.buildPortfolio(reqObj.source, identifier) });
  }

  async handleTrade(
    reqObj: PromiseRequest<CryptoTradeDTO>,
    resp: PromiseEventResp<CryptoPortfolio>,
  ): Promise<void> {
    const src = reqObj.source;
    const identifier = PlayerService.getIdentifier(src);
    const { symbol, side } = reqObj.data ?? ({} as CryptoTradeDTO);

    const fail = (errorMsg: CryptoError) => resp({ status: 'error', errorMsg });

    // The price is read once here and used for the whole trade, so the number
    // the player agreed to is the number they get even if a tick lands mid-way.
    const price = getPrice(symbol);
    if (price === null) return fail('UNKNOWN_COIN');

    const amount = Number(reqObj.data?.amount);
    if (!Number.isFinite(amount) || amount <= 0) return fail('INVALID_AMOUNT');

    if (side === 'buy') {
      // `amount` is dollars to spend when buying.
      const spend = Math.floor(amount);
      if (spend <= 0) return fail('INVALID_AMOUNT');
      if (getBankBalance(src) < spend) return fail('INSUFFICIENT_FUNDS');

      const coins = Number((spend / price).toFixed(8));
      if (coins <= 0) return fail('INVALID_AMOUNT');

      if (!removeBankMoney(src, spend, 'crypto-buy')) return fail('INSUFFICIENT_FUNDS');

      const held = await this.cryptoDB.getHolding(identifier, symbol);
      await this.cryptoDB.saveHolding(
        identifier,
        symbol,
        Number(held?.amount ?? 0) + coins,
        Number(held?.cost_basis ?? 0) + spend,
      );
      await this.cryptoDB.addTrade(identifier, symbol, 'buy', coins, price, spend);
    } else if (side === 'sell') {
      // `amount` is coins to sell.
      const held = await this.cryptoDB.getHolding(identifier, symbol);
      const owned = Number(held?.amount ?? 0);
      if (owned < amount - DUST) return fail('INSUFFICIENT_COINS');

      const proceeds = Math.floor(amount * price);
      if (proceeds <= 0) return fail('INVALID_AMOUNT');

      const remaining = Math.max(0, Number((owned - amount).toFixed(8)));
      // Cost basis shrinks proportionally, so a partial sell leaves the
      // remainder's basis intact rather than crediting it all to what's left.
      const basis = Number(held?.cost_basis ?? 0);
      const remainingBasis = remaining <= DUST ? 0 : Number(((basis * remaining) / owned).toFixed(2));

      await this.cryptoDB.saveHolding(identifier, symbol, remaining, remainingBasis);
      await this.cryptoDB.addTrade(identifier, symbol, 'sell', amount, price, proceeds);

      if (!addBankMoney(src, proceeds, 'crypto-sell')) {
        cryptoLogger.error(`Could not pay out crypto sale for ${identifier} (${proceeds})`);
      }
    } else {
      return fail('INVALID_AMOUNT');
    }

    resp({ status: 'ok', data: await this.buildPortfolio(src, identifier) });
  }
}

const CryptoService = new _CryptoService();
export default CryptoService;
