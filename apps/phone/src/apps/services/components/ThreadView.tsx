import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Send } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { NPWDInput } from '@ui/components/Input';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useNuiEvent } from '@common/hooks/useNuiEvent';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { ServiceActionResp, ServiceMessage, ServicesEvents, ServiceThread } from '@typings/services';
import { browserThread, formatServiceTime, serviceErrorText } from '../utils';

export const ThreadView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { addAlert } = useSnackbar();
  const [thread, setThread] = useState<ServiceThread | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const resp = await fetchNui<ServiceThread>(ServicesEvents.GET_THREAD, { id: Number(id) }, browserThread(Number(id)));
      if (!resp || resp.error) {
        addAlert({ message: serviceErrorText(resp?.error ?? 'no_access'), type: 'error' });
        history.replace('/services/messages');
        return;
      }
      setThread(resp);
    } catch (e) {
      console.error(e);
    }
  }, [id, addAlert, history]);

  useEffect(() => {
    load();
  }, [load]);

  useNuiEvent<ServiceMessage>('SERVICES', ServicesEvents.NEW_MESSAGE, (message) => {
    setThread((previous) =>
      previous && message.channelId === previous.id && !previous.messages.some((m) => m.id === message.id)
        ? { ...previous, messages: [...previous.messages, message] }
        : previous,
    );
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages.length]);

  const send = async (shareLocation: boolean) => {
    if (!thread || sending || (!shareLocation && !text.trim())) return;
    setSending(true);

    try {
      const resp = await fetchNui<ServiceActionResp>(
        ServicesEvents.SEND_MESSAGE,
        { id: thread.id, text: shareLocation ? '' : text, shareLocation },
        {
          ok: true,
          message: {
            id: Date.now(),
            channelId: thread.id,
            senderName: 'Johnny Klebitz',
            fromCompany: thread.asCompany,
            mine: true,
            message: shareLocation ? '' : text,
            x: shareLocation ? 0 : null,
            y: shareLocation ? 0 : null,
            createdAt: Date.now(),
          },
        },
      );

      if (!resp?.ok || !resp.message) {
        addAlert({ message: serviceErrorText(resp?.error), type: 'error' });
        return;
      }

      const sent = { ...resp.message, mine: true };
      setThread((previous) => (previous ? { ...previous, messages: [...previous.messages, sent] } : previous));
      if (!shareLocation) setText('');
    } catch (e) {
      addAlert({ message: serviceErrorText(), type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const markLocation = (message: ServiceMessage) => {
    fetchNui(ServicesEvents.SET_WAYPOINT, { x: message.x, y: message.y }, { ok: true }).catch(console.error);
    addAlert({ message: 'Location marked on your GPS.', type: 'success' });
  };

  if (!thread) return <LoadingSpinner />;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-1 border-b border-neutral-200 px-2 pb-2 dark:border-neutral-800">
        <button
          type="button"
          aria-label="Back"
          onClick={() => history.push('/services/messages')}
          className="rounded-full p-1 text-sky-500"
        >
          <ChevronLeft size={26} />
        </button>
        <div className="min-w-0">
          <p className="truncate font-semibold">{thread.title}</p>
          {thread.asCompany && thread.contactNumber && (
            <p className="truncate text-xs text-neutral-500">Customer · {thread.contactNumber}</p>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
        {thread.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-500">Send the first message.</p>
        )}

        {thread.messages.map((message) => {
          const hasLocation = message.x != null && message.y != null;
          const showName = !message.mine && (thread.asCompany ? !message.fromCompany : message.fromCompany);

          return (
            <div key={message.id} className={cn('flex max-w-[80%] flex-col', message.mine ? 'self-end items-end' : 'self-start items-start')}>
              {showName && <span className="mb-0.5 px-2 text-[11px] text-neutral-500">{message.senderName}</span>}
              <div
                className={cn(
                  'rounded-2xl px-3 py-2 text-[15px] leading-snug',
                  message.mine
                    ? 'rounded-br-md bg-sky-500 text-white'
                    : 'rounded-bl-md bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
                )}
              >
                {message.message && <p className="whitespace-pre-wrap break-words">{message.message}</p>}
                {hasLocation && (
                  <button
                    type="button"
                    onClick={() => markLocation(message)}
                    className={cn('flex items-center gap-1.5 font-semibold', message.message && 'mt-1')}
                  >
                    <MapPin size={16} /> Shared location · Set GPS
                  </button>
                )}
              </div>
              <span className="mt-0.5 px-2 text-[10px] text-neutral-500">{formatServiceTime(message.createdAt)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-neutral-200 px-3 pb-8 pt-2 dark:border-neutral-800"
        onSubmit={(event) => {
          event.preventDefault();
          send(false);
        }}
      >
        <button
          type="button"
          aria-label="Share location"
          disabled={sending}
          onClick={() => send(true)}
          className="rounded-full bg-neutral-200 p-2 text-sky-500 disabled:opacity-50 dark:bg-neutral-800"
        >
          <MapPin size={20} />
        </button>
        <NPWDInput
          value={text}
          maxLength={500}
          placeholder="Message"
          onChange={(event) => setText(event.target.value)}
          className="rounded-full"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={sending || !text.trim()}
          className="rounded-full bg-sky-500 p-2 text-white disabled:opacity-40"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
