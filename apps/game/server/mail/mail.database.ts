import { ResultSetHeader } from 'mysql2';
import { DbInterface } from '@npwd/database';
import { MailAction, MailMessage } from '@typings/mail';

interface MailRow {
  id: number;
  recipient_identifier: string | null;
  recipient_address: string;
  sender_name: string;
  sender_address: string | null;
  subject: string;
  content: string;
  actions: string | null;
  is_read: number;
  timestamp: number;
}

export interface NewMail {
  recipientIdentifier: string;
  recipientAddress: string;
  senderIdentifier: string | null;
  senderName: string;
  senderAddress: string | null;
  subject: string;
  content: string;
  actions: MailAction[];
}

const parseActions = (raw: string | null): MailAction[] => {
  if (!raw) return [];
  try {
    const actions = JSON.parse(raw);
    return Array.isArray(actions) ? actions : [];
  } catch (e) {
    return [];
  }
};

export class _MailDB {
  // Also in import.sql; created here so an existing server needs no manual import.
  async ensureTables(): Promise<void> {
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_mail_accounts
      (
          identifier varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          address    varchar(100) NOT NULL,
          PRIMARY KEY (identifier),
          UNIQUE INDEX address (address)
      )`);
    await DbInterface._rawExec(`
      CREATE TABLE IF NOT EXISTS npwd_mail_messages
      (
          id                   int(11)      NOT NULL AUTO_INCREMENT,
          recipient_identifier varchar(48)  NOT NULL COLLATE 'utf8mb4_general_ci',
          recipient_address    varchar(100) NOT NULL DEFAULT '',
          sender_identifier    varchar(48)           DEFAULT NULL COLLATE 'utf8mb4_general_ci',
          sender_name          varchar(100) NOT NULL,
          sender_address       varchar(100)          DEFAULT NULL,
          subject              varchar(100) NOT NULL,
          content              text         NOT NULL,
          actions              longtext              DEFAULT NULL,
          is_read              tinyint      NOT NULL DEFAULT 0,
          recipient_deleted    tinyint      NOT NULL DEFAULT 0,
          sender_deleted       tinyint      NOT NULL DEFAULT 0,
          createdAt            timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX recipient_identifier (recipient_identifier),
          INDEX sender_identifier (sender_identifier)
      )`);
  }

  async findAddress(identifier: string): Promise<string | null> {
    const [rows] = await DbInterface._rawExec(
      'SELECT address FROM npwd_mail_accounts WHERE identifier = ?',
      [identifier],
    );
    return (<{ address: string }[]>rows)[0]?.address ?? null;
  }

  async findIdentifierByAddress(address: string): Promise<string | null> {
    const [rows] = await DbInterface._rawExec(
      'SELECT identifier FROM npwd_mail_accounts WHERE address = ?',
      [address],
    );
    return (<{ identifier: string }[]>rows)[0]?.identifier ?? null;
  }

  async createAccount(identifier: string, address: string): Promise<void> {
    await DbInterface._rawExec(
      'INSERT INTO npwd_mail_accounts (identifier, address) VALUES (?, ?)',
      [identifier, address],
    );
  }

  async insertMail(mail: NewMail): Promise<number> {
    const query = `
      INSERT INTO npwd_mail_messages
        (recipient_identifier, recipient_address, sender_identifier, sender_name, sender_address, subject, content, actions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await DbInterface._rawExec(query, [
      mail.recipientIdentifier,
      mail.recipientAddress,
      mail.senderIdentifier,
      mail.senderName,
      mail.senderAddress,
      mail.subject,
      mail.content,
      mail.actions.length ? JSON.stringify(mail.actions) : null,
    ]);
    return (<ResultSetHeader>result).insertId;
  }

  async fetchMailbox(identifier: string, limit: number): Promise<MailMessage[]> {
    const query = `
      SELECT id, recipient_identifier, recipient_address, sender_name, sender_address, subject, content,
             actions, is_read, CAST(UNIX_TIMESTAMP(createdAt) AS UNSIGNED) * 1000 AS timestamp
      FROM npwd_mail_messages
      WHERE (recipient_identifier = ? AND recipient_deleted = 0)
         OR (sender_identifier = ? AND sender_deleted = 0)
      ORDER BY id DESC
      LIMIT ${Math.trunc(limit)}`;
    const [rows] = await DbInterface._rawExec(query, [identifier, identifier]);

    return (<MailRow[]>rows).map((row) => ({
      id: row.id,
      folder: row.recipient_identifier === identifier ? 'inbox' : 'sent',
      senderName: row.sender_name,
      senderAddress: row.sender_address,
      recipientAddress: row.recipient_address,
      subject: row.subject,
      content: row.content,
      actions: parseActions(row.actions),
      read: !!row.is_read,
      timestamp: Number(row.timestamp),
    }));
  }

  async markRead(id: number, identifier: string): Promise<void> {
    await DbInterface._rawExec(
      'UPDATE npwd_mail_messages SET is_read = 1 WHERE id = ? AND recipient_identifier = ?',
      [id, identifier],
    );
  }

  async deleteMail(id: number, identifier: string): Promise<void> {
    await DbInterface._rawExec(
      'UPDATE npwd_mail_messages SET recipient_deleted = 1 WHERE id = ? AND recipient_identifier = ?',
      [id, identifier],
    );
    await DbInterface._rawExec(
      'UPDATE npwd_mail_messages SET sender_deleted = 1 WHERE id = ? AND sender_identifier = ?',
      [id, identifier],
    );
  }
}

export const MailDB = new _MailDB();
