import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';
import { WalletTransaction } from '@typings/wallet';

export class _WalletDB {
  // Also in import.sql. Created here too so an existing server picks the app up
  // without anyone re-running the import by hand.
  async ensureTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS npwd_wallet_transactions
      (
          id         int(11)      NOT NULL AUTO_INCREMENT,
          identifier varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          amount     int(11)      NOT NULL,
          company    varchar(50)  NOT NULL,
          logo       varchar(255)          DEFAULT NULL,
          createdAt  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX identifier (identifier)
      )`;
    await DbInterface._rawExec(query);
  }

  async addTransaction(
    identifier: string,
    amount: number,
    company: string,
    logo: string | null,
  ): Promise<WalletTransaction> {
    const query =
      'INSERT INTO npwd_wallet_transactions (identifier, amount, company, logo) VALUES (?, ?, ?, ?)';
    const [result] = await DbInterface._rawExec(query, [identifier, amount, company, logo]);
    return {
      id: (<ResultSetHeader>result).insertId,
      amount,
      company,
      logo,
      timestamp: Date.now(),
    };
  }

  async fetchTransactions(
    identifier: string,
    limit: number,
    offset: number,
  ): Promise<WalletTransaction[]> {
    // limit/offset are integers computed server-side, inlined because mysql2
    // prepared statements reject numeric LIMIT placeholders on newer MySQL.
    const query = `
      SELECT id, amount, company, logo, CAST(UNIX_TIMESTAMP(createdAt) AS UNSIGNED) * 1000 AS timestamp
      FROM npwd_wallet_transactions
      WHERE identifier = ?
      ORDER BY id DESC
      LIMIT ${Math.trunc(limit)} OFFSET ${Math.trunc(offset)}`;
    const [result] = await DbInterface._rawExec(query, [identifier]);
    return (<WalletTransaction[]>result).map((row) => ({ ...row, timestamp: Number(row.timestamp) }));
  }
}

export const WalletDB = new _WalletDB();
