import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ChevronLeft, Reply, Trash2 } from 'lucide-react';
import qs from 'qs';
import dayjs from 'dayjs';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { MailAction, MailEvents } from '@typings/mail';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useMailbox } from '../hooks/useMailbox';

export const MailDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { mailbox, markReadLocally, removeMessage } = useMailbox();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const message = mailbox?.messages.find((m) => m.id === Number(id));

  useEffect(() => {
    if (!message || message.folder !== 'inbox' || message.read) return;
    markReadLocally(message.id);
    fetchNui(MailEvents.MARK_READ, { id: message.id }, { status: 'ok' }).catch(console.error);
  }, [message, markReadLocally]);

  if (!mailbox) return <LoadingSpinner />;

  const back = (
    <button
      type="button"
      onClick={() => history.push('/mail')}
      className="flex items-center text-sky-500"
    >
      <ChevronLeft size={24} />
      <span>{message?.folder === 'sent' ? 'Sent' : 'Inbox'}</span>
    </button>
  );

  if (!message) {
    return (
      <div className="px-2">
        {back}
        <p className="p-8 text-center text-neutral-500">This email is no longer here.</p>
      </div>
    );
  }

  const runAction = (action: MailAction) => {
    fetchNui(MailEvents.RUN_ACTION, action, {}).catch(console.error);
  };

  const reply = () => {
    const subject = message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`;
    history.push(`/mail/compose?${qs.stringify({ to: message.senderAddress, subject })}`);
  };

  const remove = async () => {
    const resp = await fetchNui<ServerPromiseResp>(MailEvents.DELETE, { id: message.id }, { status: 'ok' });
    if (resp.status !== 'ok') return;
    removeMessage(message.id);
    history.replace('/mail');
  };

  const counterpart = message.folder === 'inbox' ? message.senderName : message.recipientAddress;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-2 pb-2">
        {back}
        <div className="flex gap-1">
          {message.folder === 'inbox' && message.senderAddress && (
            <button
              type="button"
              aria-label="Reply"
              onClick={reply}
              className="rounded-full p-2 text-sky-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Reply size={20} />
            </button>
          )}
          <button
            type="button"
            aria-label="Delete"
            onClick={() => setConfirmDelete(true)}
            className="rounded-full p-2 text-sky-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <h2 className="mb-3 text-xl font-bold">{message.subject}</h2>

        <div className="mb-4 flex items-center gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-300 font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
            {counterpart.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{counterpart}</p>
            <p className="truncate text-xs text-neutral-500">
              {message.folder === 'inbox'
                ? `To: ${message.recipientAddress || 'you'}`
                : `From: ${message.senderAddress}`}
            </p>
          </div>
          <span className="shrink-0 text-xs text-neutral-500">
            {dayjs(message.timestamp).format('MMM D, h:mm A')}
          </span>
        </div>

        <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{message.content}</p>

        {message.actions.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {message.actions.map((action, index) => (
              <button
                type="button"
                key={`${action.event}-${index}`}
                onClick={() => runAction(action)}
                className="rounded-xl bg-sky-500 py-3 font-semibold text-white hover:bg-sky-600"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 p-8"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full rounded-2xl bg-white p-5 text-center dark:bg-neutral-800"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="mb-1 text-lg font-semibold">Delete Email</h4>
            <p className="mb-4 text-sm text-neutral-500">Are you sure you want to delete this email?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl bg-neutral-200 py-2 dark:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={remove}
                className="flex-1 rounded-xl bg-red-500 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
