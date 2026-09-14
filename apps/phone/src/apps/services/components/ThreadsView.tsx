import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import fetchNui from '@utils/fetchNui';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { ServicesEvents, ServiceThreadSummary } from '@typings/services';
import { BrowserThreads, formatServiceTime } from '../utils';

export const ThreadsView: React.FC = () => {
  const history = useHistory();
  const [threads, setThreads] = useState<ServiceThreadSummary[] | null>(null);

  useEffect(() => {
    fetchNui<ServiceThreadSummary[]>(ServicesEvents.GET_THREADS, undefined, BrowserThreads)
      .then((list) => setThreads(Array.isArray(list) ? list : []))
      .catch((e) => {
        console.error(e);
        setThreads([]);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <h1 className="px-4 pb-3 pt-2 text-3xl font-bold">Messages</h1>

      {threads === null && <LoadingSpinner />}
      {threads?.length === 0 && (
        <p className="px-8 py-12 text-center text-neutral-500">
          No conversations yet. Message a company from the Companies tab.
        </p>
      )}

      {threads?.map((thread) => (
        <button
          type="button"
          key={thread.id}
          onClick={() => history.push(`/services/thread/${thread.id}`)}
          className="flex w-full items-center gap-3 border-b border-neutral-200 px-4 py-3 text-left hover:bg-neutral-200/60 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
        >
          {thread.icon ? (
            <img src={thread.icon} alt="" className="h-11 w-11 shrink-0 rounded-full bg-neutral-100 object-contain p-1.5 dark:bg-neutral-700" />
          ) : (
            <div className="h-11 w-11 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate font-semibold">{thread.title}</span>
              <span className="shrink-0 text-xs text-neutral-500">{formatServiceTime(thread.updatedAt)}</span>
            </div>
            {thread.asCompany && (
              <span className="mr-1 rounded bg-sky-500/15 px-1.5 text-[10px] font-semibold uppercase text-sky-500">
                Customer
              </span>
            )}
            <span className="truncate text-sm text-neutral-500">{thread.lastMessage ?? 'No messages yet'}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
