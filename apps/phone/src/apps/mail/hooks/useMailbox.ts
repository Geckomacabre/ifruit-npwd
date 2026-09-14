import { useCallback } from 'react';
import { atom, useRecoilState } from 'recoil';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { MailboxResp, MailEvents, MailMessage } from '@typings/mail';
import { BrowserMailbox } from '../utils/constants';

const mailboxState = atom<MailboxResp | null>({
  key: 'mail.mailbox',
  default: null,
});

export const useMailbox = () => {
  const [mailbox, setMailbox] = useRecoilState(mailboxState);

  const refresh = useCallback(async () => {
    try {
      const resp = await fetchNui<ServerPromiseResp<MailboxResp>>(
        MailEvents.FETCH_MAILBOX,
        undefined,
        { status: 'ok', data: BrowserMailbox },
      );
      if (resp.status === 'ok') setMailbox(resp.data);
    } catch (e) {
      console.error(e);
    }
  }, [setMailbox]);

  const addMessage = useCallback(
    (message: MailMessage) =>
      setMailbox((previous) =>
        previous
          ? { ...previous, messages: [message, ...previous.messages.filter((m) => m.id !== message.id)] }
          : previous,
      ),
    [setMailbox],
  );

  const markReadLocally = useCallback(
    (id: number) =>
      setMailbox((previous) =>
        previous
          ? {
              ...previous,
              messages: previous.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
            }
          : previous,
      ),
    [setMailbox],
  );

  const removeMessage = useCallback(
    (id: number) =>
      setMailbox((previous) =>
        previous ? { ...previous, messages: previous.messages.filter((m) => m.id !== id) } : previous,
      ),
    [setMailbox],
  );

  return { mailbox, refresh, addMessage, markReadLocally, removeMessage };
};
