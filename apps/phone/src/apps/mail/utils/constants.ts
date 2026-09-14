import dayjs from 'dayjs';
import { MailboxResp, MailError } from '@typings/mail';

const SEND_ERRORS: Record<MailError, string> = {
  RECIPIENT_NOT_FOUND: 'Nobody uses that address.',
  EMPTY_MESSAGE: 'Write something first.',
};

export const sendErrorText = (code?: string): string =>
  SEND_ERRORS[code as MailError] ?? 'The email could not be sent.';

// Today: 4:12 PM. This week: Tue. Older: 9/2/26.
export const formatMailTime = (timestamp: number): string => {
  const time = dayjs(timestamp);
  const now = dayjs();
  if (time.isSame(now, 'day')) return time.format('h:mm A');
  if (now.diff(time, 'day') < 7) return time.format('ddd');
  return time.format('M/D/YY');
};

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserMailbox: MailboxResp = {
  address: 'johnny.klebitz@lsmail.com',
  messages: [
    {
      id: 3,
      folder: 'inbox',
      senderName: 'Dealer Tony',
      senderAddress: null,
      recipientAddress: 'johnny.klebitz@lsmail.com',
      subject: 'Delivery Location',
      content: 'Bring 10 bags to the drop. Tap below and I will mark it on your GPS.',
      actions: [{ label: 'Accept', event: 'qb-drugs:client:setLocation', isServer: false, data: null }],
      read: false,
      timestamp: Date.now() - 600e3,
    },
    {
      id: 2,
      folder: 'inbox',
      senderName: 'Trevor Philips',
      senderAddress: 'trevor.philips@lsmail.com',
      recipientAddress: 'johnny.klebitz@lsmail.com',
      subject: 'The airfield',
      content: 'Get out to Sandy Shores. Bring the truck.\n\nDo not be late.',
      actions: [],
      read: true,
      timestamp: Date.now() - 86400e3,
    },
    {
      id: 1,
      folder: 'sent',
      senderName: 'Johnny Klebitz',
      senderAddress: 'johnny.klebitz@lsmail.com',
      recipientAddress: 'trevor.philips@lsmail.com',
      subject: 'Re: The airfield',
      content: 'On my way.',
      actions: [],
      read: true,
      timestamp: Date.now() - 80000e3,
    },
  ],
};
