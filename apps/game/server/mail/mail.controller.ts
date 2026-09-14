import { MailboxResp, MailEvents, MailIdDTO, MailMessage, MailSendDTO } from '@typings/mail';
import MailService, { IncomingMail } from './mail.service';
import { MailDB } from './mail.database';
import { mailLogger } from './mail.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';
import PlayerService from '../players/player.service';
import { getSource } from '../utils/miscUtils';

MailDB.ensureTables().catch((e) =>
  mailLogger.error(`Could not create mail tables, Error: ${e.message}`),
);

onNetPromise<void, MailboxResp>(MailEvents.FETCH_MAILBOX, (reqObj, resp) => {
  MailService.handleFetchMailbox(reqObj, resp).catch((e) => {
    mailLogger.error(`Error occurred in fetch mailbox event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<MailSendDTO, MailMessage>(MailEvents.SEND, (reqObj, resp) => {
  MailService.handleSend(reqObj, resp).catch((e) => {
    mailLogger.error(`Error occurred in send mail event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<MailIdDTO, void>(MailEvents.MARK_READ, (reqObj, resp) => {
  MailService.handleMarkRead(reqObj, resp).catch((e) => {
    mailLogger.error(`Error occurred in mark read event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<MailIdDTO, void>(MailEvents.DELETE, (reqObj, resp) => {
  MailService.handleDelete(reqObj, resp).catch((e) => {
    mailLogger.error(`Error occurred in delete mail event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

// ---------------------------------------------------------------------------
// qb-phone compatibility. qbx_drugs, um_pawnshop, um_scrapyard, um_truckrobbery,
// um_HouseRobberys, um_vehiclesales, qbx_ambulancejob and jim_bridge all send
// mail through these, so they keep working with no changes on their side.
// ---------------------------------------------------------------------------

interface QbMailData {
  sender?: string;
  subject?: string;
  message?: string;
  button?: { enabled?: boolean; buttonEvent?: string; buttonData?: unknown; buttonText?: string };
}

const sendQbMail = (identifier: string, data: QbMailData) => {
  const button = data?.button;
  const mail: IncomingMail = {
    sender: data?.sender,
    subject: data?.subject,
    message: data?.message,
    actions:
      button?.enabled && button.buttonEvent
        ? [{ label: button.buttonText ?? 'Accept', event: button.buttonEvent, data: button.buttonData }]
        : [],
  };

  MailService.sendToIdentifier(identifier, mail, false).catch((e) =>
    mailLogger.error(`Could not deliver qb-phone mail to ${identifier}, Error: ${e.message}`),
  );
};

// Sent by a player's own client, to themselves.
onNet('qb-phone:server:sendNewMail', (data: QbMailData) => {
  const identifier = PlayerService.getPlayer(getSource())?.getIdentifier();
  if (identifier) sendQbMail(identifier, data);
});

// Server-only: a client triggering this could mail anyone a button that fires
// events on the victim's client, so net calls from players are dropped.
onNet('qb-phone:server:sendNewMailToOffline', (citizenid: string, data: QbMailData) => {
  if (Number(getSource()) > 0) {
    return mailLogger.warn(`Player ${getSource()} tried to trigger sendNewMailToOffline from their client`);
  }
  if (typeof citizenid === 'string' && citizenid) sendQbMail(citizenid, data);
});

on('__cfx_export_qb-phone_sendNewMailToOffline', (setCB: (fn: unknown) => void) => {
  setCB((citizenid: string, data: QbMailData) => {
    if (typeof citizenid === 'string' && citizenid) sendQbMail(citizenid, data);
  });
});

// ---------------------------------------------------------------------------
// Exports (lb-phone's SendMail / GetEmailAddress equivalents).
// ---------------------------------------------------------------------------

const exp = global.exports;

// exports.npwd:sendMail({ to = 'someone@lsmail.com', sender, subject, message, actions })
exp('sendMail', async (data: IncomingMail & { to?: string }) => {
  const identifier = await MailService.findIdentifierByAddress(String(data?.to ?? ''));
  if (!identifier) return false;
  await MailService.sendToIdentifier(identifier, data, true);
  return true;
});

// exports.npwd:sendMailToPlayer(source or citizenid, { sender, subject, message, actions })
exp('sendMailToPlayer', async (target: number | string, data: IncomingMail) => {
  const identifier =
    typeof target === 'number' ? PlayerService.getPlayer(target)?.getIdentifier() : target;
  if (!identifier) return false;
  await MailService.sendToIdentifier(identifier, data, true);
  return true;
});

// Synchronous for Lua callers: addresses are cached once a player has opened
// Mail (or been looked up) this session.
exp('getEmailAddress', (target: number | string) => {
  const identifier =
    typeof target === 'number' ? PlayerService.getPlayer(target)?.getIdentifier() : target;
  return identifier ? MailService.getCachedAddress(identifier) : null;
});
