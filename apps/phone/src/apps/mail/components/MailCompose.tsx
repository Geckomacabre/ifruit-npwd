import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { MAIL_CONTENT_MAX, MAIL_SUBJECT_MAX, MailEvents, MailMessage } from '@typings/mail';
import { NPWDInput, NPWDTextarea } from '@ui/components/Input';
import { useQueryParams } from '@common/hooks/useQueryParams';
import { useMailbox } from '../hooks/useMailbox';
import { sendErrorText } from '../utils/constants';

export const MailCompose: React.FC = () => {
  const history = useHistory();
  const preset = useQueryParams<{ to: string; subject: string }>({ to: '', subject: '' });
  const { mailbox, addMessage } = useMailbox();

  const [to, setTo] = useState(preset.to);
  const [subject, setSubject] = useState(preset.subject);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (sending) return;
    setError(null);
    setSending(true);

    try {
      const resp = await fetchNui<ServerPromiseResp<MailMessage>>(
        MailEvents.SEND,
        { to, subject, content },
        {
          status: 'ok',
          data: {
            id: Date.now(),
            folder: 'sent',
            senderName: 'Johnny Klebitz',
            senderAddress: mailbox?.address ?? null,
            recipientAddress: to,
            subject: subject || '(No subject)',
            content,
            actions: [],
            read: true,
            timestamp: Date.now(),
          },
        },
      );

      if (resp.status !== 'ok') return setError(sendErrorText(resp.errorMsg));

      addMessage(resp.data);
      history.replace('/mail');
    } catch (e) {
      setError(sendErrorText());
    } finally {
      setSending(false);
    }
  };

  const rowClass =
    'flex items-center gap-2 border-b border-neutral-200 px-4 py-2 text-sm dark:border-neutral-800';

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 pb-3">
        <button type="button" onClick={() => history.goBack()} className="text-sky-500">
          Cancel
        </button>
        <h2 className="font-semibold">New Message</h2>
        <button
          type="button"
          onClick={send}
          disabled={sending || !to.trim() || !content.trim()}
          className="font-semibold text-sky-500 disabled:opacity-40"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </header>

      <div className={rowClass}>
        <span className="w-14 text-neutral-500">To:</span>
        <NPWDInput
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="name@lsmail.com"
          className="bg-transparent px-0 dark:bg-transparent"
        />
      </div>
      <div className={rowClass}>
        <span className="w-14 text-neutral-500">From:</span>
        <span className="truncate text-neutral-500">{mailbox?.address}</span>
      </div>
      <div className={rowClass}>
        <span className="w-14 text-neutral-500">Subject:</span>
        <NPWDInput
          value={subject}
          maxLength={MAIL_SUBJECT_MAX}
          onChange={(event) => setSubject(event.target.value)}
          className="bg-transparent px-0 dark:bg-transparent"
        />
      </div>

      {error && (
        <p className="mx-4 mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      <NPWDTextarea
        value={content}
        maxLength={MAIL_CONTENT_MAX}
        onChange={(event) => setContent(event.target.value)}
        className="m-0 flex-1 resize-none rounded-none bg-transparent px-4 py-3 dark:bg-transparent"
      />
    </div>
  );
};
