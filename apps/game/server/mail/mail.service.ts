import {
  MAIL_CONTENT_MAX,
  MAIL_DOMAIN,
  MAIL_SUBJECT_MAX,
  MailboxResp,
  MailError,
  MailEvents,
  MailIdDTO,
  MailMessage,
  MailSendDTO,
} from '@typings/mail';
import PlayerService from '../players/player.service';
import { Player } from '../players/player.class';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { MailDB, NewMail, _MailDB } from './mail.database';
import { mailLogger, normalizeActions, toPlainText } from './mail.utils';

const MAILBOX_LIMIT = 100;
const SENDER_MAX = 100;
const ADDRESS_MAX = 100;

export interface IncomingMail {
  sender?: unknown;
  subject?: unknown;
  message?: unknown;
  actions?: unknown;
}

const addressPart = (value: string | null) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

class _MailService {
  private readonly mailDB: _MailDB;
  // identifier -> address. Lets getEmailAddress answer synchronously, which Lua
  // callers of the export expect.
  private readonly addressCache = new Map<string, string>();

  constructor() {
    this.mailDB = MailDB;
    mailLogger.debug('Mail service started');
  }

  getCachedAddress(identifier: string): string | null {
    return this.addressCache.get(identifier) ?? null;
  }

  /** The player's address, generating firstname.lastname@lsmail.com on first use. */
  async ensureAccount(player: Player): Promise<string> {
    const identifier = player.getIdentifier();
    const cached = this.addressCache.get(identifier);
    if (cached) return cached;

    let address = await this.mailDB.findAddress(identifier);

    if (!address) {
      const name = [addressPart(player.getFirstName()), addressPart(player.getLastName())]
        .filter(Boolean)
        .join('.');
      const base = name || `user${addressPart(identifier).slice(-6)}`;

      for (let attempt = 0; attempt < 50 && !address; attempt++) {
        const candidate = `${base}${attempt ? attempt + 1 : ''}@${MAIL_DOMAIN}`;
        if (!(await this.mailDB.findIdentifierByAddress(candidate))) {
          await this.mailDB.createAccount(identifier, candidate);
          address = await this.mailDB.findAddress(identifier);
        }
      }
    }

    if (!address) throw new Error(`Could not create a mail address for ${identifier}`);

    this.addressCache.set(identifier, address);
    return address;
  }

  async handleFetchMailbox(reqObj: PromiseRequest<void>, resp: PromiseEventResp<MailboxResp>) {
    const player = PlayerService.getPlayer(reqObj.source);

    try {
      const address = await this.ensureAccount(player);
      const messages = await this.mailDB.fetchMailbox(player.getIdentifier(), MAILBOX_LIMIT);
      resp({ status: 'ok', data: { address, messages } });
    } catch (e) {
      mailLogger.error(`Error in handleFetchMailbox, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleSend(reqObj: PromiseRequest<MailSendDTO>, resp: PromiseEventResp<MailMessage>) {
    const player = PlayerService.getPlayer(reqObj.source);
    const fail = (errorMsg: MailError) => resp({ status: 'error', errorMsg });

    const to = String(reqObj.data?.to ?? '').trim().toLowerCase().slice(0, ADDRESS_MAX);
    const subject = toPlainText(reqObj.data?.subject, MAIL_SUBJECT_MAX) || '(No subject)';
    const content = toPlainText(reqObj.data?.content, MAIL_CONTENT_MAX);

    if (!content) return fail('EMPTY_MESSAGE');

    try {
      const recipientIdentifier = to ? await this.mailDB.findIdentifierByAddress(to) : null;
      if (!recipientIdentifier) return fail('RECIPIENT_NOT_FOUND');

      const address = await this.ensureAccount(player);
      const message = await this.deliver({
        recipientIdentifier,
        recipientAddress: to,
        senderIdentifier: player.getIdentifier(),
        senderName: player.getName() ?? address,
        senderAddress: address,
        subject,
        content,
        actions: [],
      });

      resp({
        status: 'ok',
        data: { ...message, folder: recipientIdentifier === player.getIdentifier() ? 'inbox' : 'sent' },
      });
    } catch (e) {
      mailLogger.error(`Error in handleSend, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleMarkRead(reqObj: PromiseRequest<MailIdDTO>, resp: PromiseEventResp<void>) {
    try {
      await this.mailDB.markRead(Number(reqObj.data?.id), PlayerService.getIdentifier(reqObj.source));
      resp({ status: 'ok' });
    } catch (e) {
      mailLogger.error(`Error in handleMarkRead, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleDelete(reqObj: PromiseRequest<MailIdDTO>, resp: PromiseEventResp<void>) {
    try {
      await this.mailDB.deleteMail(Number(reqObj.data?.id), PlayerService.getIdentifier(reqObj.source));
      resp({ status: 'ok' });
    } catch (e) {
      mailLogger.error(`Error in handleDelete, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  /**
   * Mail from game systems rather than a player (job offers, deliveries...).
   * The recipient needs no address yet; it shows up once they open Mail.
   */
  async sendToIdentifier(
    identifier: string,
    mail: IncomingMail,
    allowServerActions: boolean,
  ): Promise<MailMessage> {
    return this.deliver({
      recipientIdentifier: identifier,
      recipientAddress: (await this.mailDB.findAddress(identifier)) ?? '',
      senderIdentifier: null,
      senderName: toPlainText(mail.sender, SENDER_MAX) || 'Unknown',
      senderAddress: null,
      subject: toPlainText(mail.subject, MAIL_SUBJECT_MAX) || '(No subject)',
      content: toPlainText(mail.message, MAIL_CONTENT_MAX),
      actions: normalizeActions(mail.actions, allowServerActions),
    });
  }

  async findIdentifierByAddress(address: string): Promise<string | null> {
    return this.mailDB.findIdentifierByAddress(address.trim().toLowerCase());
  }

  private async deliver(mail: NewMail): Promise<MailMessage> {
    const id = await this.mailDB.insertMail(mail);

    const message: MailMessage = {
      id,
      folder: 'inbox',
      senderName: mail.senderName,
      senderAddress: mail.senderAddress,
      recipientAddress: mail.recipientAddress,
      subject: mail.subject,
      content: mail.content,
      actions: mail.actions,
      read: false,
      timestamp: Date.now(),
    };

    const recipient = PlayerService.getPlayerFromIdentifier(mail.recipientIdentifier);
    if (recipient) emitNet(MailEvents.NEW_MAIL, recipient.source, message);

    return message;
  }
}

const MailService = new _MailService();
export default MailService;
