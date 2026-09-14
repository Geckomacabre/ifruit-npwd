import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { NPWDSearchInput } from '@ui/components/Input';
import { cn } from '@utils/css';
import { useMailbox } from '../hooks/useMailbox';
import { formatMailTime } from '../utils/constants';

type Folder = 'inbox' | 'sent';

export const MailList: React.FC = () => {
  const history = useHistory();
  const { mailbox } = useMailbox();
  const [folder, setFolder] = useState<Folder>('inbox');
  const [search, setSearch] = useState('');

  const messages = useMemo(() => {
    if (!mailbox) return [];
    const query = search.trim().toLowerCase();

    return mailbox.messages
      .filter((message) => message.folder === folder)
      .filter(
        (message) =>
          !query ||
          [message.senderName, message.recipientAddress, message.subject, message.content].some((field) =>
            field?.toLowerCase().includes(query),
          ),
      );
  }, [mailbox, folder, search]);

  if (!mailbox) return <LoadingSpinner />;

  const unread = mailbox.messages.filter((message) => message.folder === 'inbox' && !message.read).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-end justify-between px-4 pb-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{folder === 'inbox' ? 'Inbox' : 'Sent'}</h1>
          <p className="truncate text-xs text-neutral-500">{mailbox.address}</p>
        </div>
        <button
          type="button"
          aria-label="New message"
          onClick={() => history.push('/mail/compose')}
          className="rounded-full p-2 text-sky-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <Pencil size={22} />
        </button>
      </header>

      <div className="px-4 pb-2">
        <NPWDSearchInput
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="mx-4 mb-2 flex rounded-lg bg-neutral-200 p-0.5 text-sm dark:bg-neutral-800">
        {(['inbox', 'sent'] as Folder[]).map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setFolder(option)}
            className={cn(
              'flex-1 rounded-md py-1',
              folder === option ? 'bg-white shadow dark:bg-neutral-600' : 'text-neutral-500',
            )}
          >
            {option === 'inbox' ? `Inbox${unread ? ` (${unread})` : ''}` : 'Sent'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="p-8 text-center text-neutral-500">
            {search ? 'No matching mail.' : folder === 'inbox' ? 'No mail yet.' : 'Nothing sent yet.'}
          </p>
        ) : (
          messages.map((message) => {
            const unreadMessage = message.folder === 'inbox' && !message.read;

            return (
              <button
                type="button"
                key={message.id}
                onClick={() => history.push(`/mail/${message.id}`)}
                className="flex w-full gap-2 border-b border-neutral-200 px-4 py-3 text-left hover:bg-neutral-200/60 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
              >
                <span
                  className={cn(
                    'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                    unreadMessage ? 'bg-sky-500' : 'bg-transparent',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={cn('truncate', unreadMessage ? 'font-bold' : 'font-semibold')}>
                      {message.folder === 'inbox' ? message.senderName : message.recipientAddress}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {formatMailTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="truncate text-sm">{message.subject}</p>
                  <p className="line-clamp-2 text-sm text-neutral-500">{message.content}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
