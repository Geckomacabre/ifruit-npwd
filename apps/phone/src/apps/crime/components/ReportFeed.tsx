import React, { useState } from 'react';
import { BadgeCheck, CheckCircle2, MapPin, MessageCircle, Plus, Siren, Trash2, X } from 'lucide-react';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { CrimeAppData, CrimeEvents, CrimeReport, CrimeResult } from '@typings/crime';
import { timeAgo } from '../utils';

interface ReportFeedProps {
  data: CrimeAppData;
  reload: () => Promise<void> | void;
}

type Tab = 'feed' | 'me';

export const ReportFeed: React.FC<ReportFeedProps> = ({ data, reload }) => {
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('feed');
  const [open, setOpen] = useState<CrimeReport | null>(null);
  const [posting, setPosting] = useState(false);
  const [comment, setComment] = useState('');
  const [form, setForm] = useState({ category: '', title: '', details: '' });

  const account = data.account!;

  const run = async (event: CrimeEvents, payload?: unknown) => {
    const result = await fetchNui<CrimeResult>(event, payload, { ok: true });
    if (!result?.ok) {
      addAlert({ message: result?.err ?? 'That did not work.', type: 'error' });
      return false;
    }
    await reload();
    return true;
  };

  const confirm = (report: CrimeReport) => run(CrimeEvents.CONFIRM, { id: report.id });

  const sendComment = async (report: CrimeReport) => {
    if (!comment.trim()) return;
    if (await run(CrimeEvents.COMMENT, { id: report.id, text: comment })) {
      setComment('');
      setOpen(null);
    }
  };

  const post = async () => {
    if (!form.category) return;
    if (await run(CrimeEvents.POST_REPORT, form)) {
      setForm({ category: '', title: '', details: '' });
      setPosting(false);
    }
  };

  const sos = async () => {
    if (await run(CrimeEvents.SOS, {})) {
      addAlert({ message: 'Dispatch has your location.', type: 'success' });
    }
  };

  const reports = tab === 'me'
    ? data.reports.filter((r) => r.author.username === account.username)
    : data.reports;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
      <header className="flex items-end justify-between px-4 pb-2 pt-2">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">Citizen</h1>
          <p className="truncate text-xs text-neutral-500">
            {account.username} · {typeof account.level === 'string' ? account.level : account.level?.name}
            {account.badge ? ` · ${account.badge}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {data.catalog.sosEnabled !== false && (
            <button
              type="button"
              aria-label="SOS"
              onClick={sos}
              className="rounded-full bg-red-600 p-2 text-white"
            >
              <Siren size={20} />
            </button>
          )}
          <button
            type="button"
            aria-label="New report"
            onClick={() => setPosting(true)}
            className="rounded-full bg-neutral-900 p-2 text-white dark:bg-white dark:text-black"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="flex gap-1 px-4 pb-3">
        {(['feed', 'me'] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 rounded-full py-1.5 text-[13px] font-semibold transition-colors',
              tab === key
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
            )}
          >
            {key === 'feed' ? 'Nearby' : 'My reports'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {reports.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">Nothing reported yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{report.title || report.categoryLabel}</span>
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    {report.author.username}
                    {report.author.badge && <BadgeCheck size={12} className="text-sky-500" />}
                    · {timeAgo(report.createdAt)}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-semibold dark:bg-neutral-700">
                  {report.categoryLabel}
                </span>
              </div>

              {report.details && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{report.details}</p>
              )}

              <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                <MapPin size={12} />
                {[report.streetLabel, report.zoneLabel].filter(Boolean).join(', ')}
              </p>

              {report.media?.[0] && (
                <img src={report.media[0]} alt="" className="mt-2 max-h-44 w-full rounded-xl object-cover" />
              )}

              <div className="mt-3 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => confirm(report)}
                  disabled={!!data.confirmed[report.id]}
                  className={cn(
                    'flex items-center gap-1 disabled:opacity-60',
                    data.confirmed[report.id] && 'text-emerald-500',
                  )}
                >
                  <CheckCircle2 size={17} />
                  {report.confirmCount}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(report)}
                  className="flex items-center gap-1"
                >
                  <MessageCircle size={17} />
                  {report.comments?.length ?? 0}
                </button>

                <button
                  type="button"
                  aria-label="Set waypoint"
                  onClick={() => fetchNui(CrimeEvents.SET_WAYPOINT, report.coords, 'ok')}
                  className="ml-auto text-neutral-400"
                >
                  <MapPin size={16} />
                </button>

                {(report.author.username === account.username || data.canModerate) && (
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => run(CrimeEvents.DELETE_REPORT, { id: report.id })}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={() => setOpen(null)}>
          <div
            className="max-h-[85%] overflow-y-auto rounded-t-[28px] bg-neutral-100 px-5 pb-10 pt-3 dark:bg-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-400/60" />
            <h2 className="mb-3 text-xl font-bold">{open.title || open.categoryLabel}</h2>

            <div className="flex flex-col gap-2">
              {(open.comments ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-neutral-500">No comments yet.</p>
              )}
              {(open.comments ?? []).map((c, i) => (
                <div key={i} className="rounded-2xl bg-white p-3 dark:bg-neutral-800">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    {c.username}
                    {c.badge && <BadgeCheck size={12} className="text-sky-500" />}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add a comment"
                className="min-w-0 flex-1 rounded-2xl bg-white p-3 text-sm outline-none dark:bg-neutral-800"
              />
              <button
                type="button"
                disabled={!comment.trim()}
                onClick={() => sendComment(open)}
                className="shrink-0 rounded-2xl bg-red-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {posting && (
        <div className="absolute inset-0 z-20 flex flex-col bg-neutral-100 px-4 pb-8 pt-12 dark:bg-neutral-900">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPosting(false)}
              className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800"
            >
              <X size={18} />
            </button>
            <span className="font-semibold">New report</span>
            <button
              type="button"
              disabled={!form.category}
              onClick={post}
              className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Post
            </button>
          </div>

          <label className="text-sm text-neutral-500">What happened</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {data.catalog.categories?.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setForm({ ...form, category: category.id })}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[13px] font-semibold',
                  form.category === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-neutral-800',
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          <label className="mt-3 text-sm text-neutral-500">Title (optional)</label>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
          />

          <label className="mt-3 text-sm text-neutral-500">Details</label>
          <textarea
            value={form.details}
            onChange={(event) => setForm({ ...form, details: event.target.value })}
            rows={4}
            className="mt-1 w-full resize-none rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
          />

          <p className="mt-3 text-xs text-neutral-500">
            Your current street and area are attached automatically.
          </p>
        </div>
      )}
    </div>
  );
};
