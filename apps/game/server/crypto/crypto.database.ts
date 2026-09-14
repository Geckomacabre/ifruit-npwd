import { DbInterface } from '@npwd/database';

export interface HoldingRow {
  symbol: string;
  amount: number;
  cost_basis: number;
}

export interface TradeRow {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  createdAt: number;
}

export class _CryptoDB {
  // Also in import.sql; created here so an existing server needs no manual import.
  async ensureTables(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_crypto_holdings
      (
          identifier varchar(48)    NOT NULL COLLATE 'utf8mb4_general_ci',
          symbol     varchar(10)    NOT NULL,
          amount     decimal(20, 8) NOT NULL DEFAULT 0,
          cost_basis decimal(20, 2) NOT NULL DEFAULT 0,
          PRIMARY KEY (identifier, symbol)
      )`);

    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_crypto_trades
      (
          id         int(11)        NOT NULL AUTO_INCREMENT,
          identifier varchar(48)    NOT NULL COLLATE 'utf8mb4_general_ci',
          symbol     varchar(10)    NOT NULL,
          side       varchar(4)     NOT NULL,
          amount     decimal(20, 8) NOT NULL,
          price      decimal(20, 4) NOT NULL,
          total      decimal(20, 2) NOT NULL,
          createdAt  timestamp      NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`);
  }

  async getHoldings(identifier: string): Promise<HoldingRow[]> {
    const [rows] = await DbInterface._rawExec(
      `SELECT symbol, amount, cost_basis FROM npwd_crypto_holdings
       WHERE identifier = ? AND amount > 0`,
      [identifier],
    );
    return rows as HoldingRow[];
  }

  async getHolding(identifier: string, symbol: string): Promise<HoldingRow | null> {
    const [rows] = await DbInterface._rawExec(
      `SELECT symbol, amount, cost_basis FROM npwd_crypto_holdings
       WHERE identifier = ? AND symbol = ?`,
      [identifier, symbol],
    );
    return (rows as HoldingRow[])[0] ?? null;
  }

  /** Upsert, because a position is created by its first buy. */
  async saveHolding(identifier: string, symbol: string, amount: number, costBasis: number): Promise<void> {
    await DbInterface._rawExec(
      `INSERT INTO npwd_crypto_holdings (identifier, symbol, amount, cost_basis)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), cost_basis = VALUES(cost_basis)`,
      [identifier, symbol, amount, costBasis],
    );
  }

  async addTrade(
    identifier: string,
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number,
    total: number,
  ): Promise<void> {
    await DbInterface._rawExec(
      `INSERT INTO npwd_crypto_trades (identifier, symbol, side, amount, price, total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [identifier, symbol, side, amount, price, total],
    );
  }

  async getTrades(identifier: string, limit: number): Promise<TradeRow[]> {
    const [rows] = await DbInterface._rawExec(
      `SELECT id, symbol, side, amount, price, total,
              CAST(UNIX_TIMESTAMP(createdAt) AS UNSIGNED) * 1000 AS createdAt
       FROM npwd_crypto_trades
       WHERE identifier = ?
       ORDER BY id DESC
       LIMIT ${limit}`,
      [identifier],
    );
    return rows as TradeRow[];
  }
}

export const CryptoDB = new _CryptoDB();
