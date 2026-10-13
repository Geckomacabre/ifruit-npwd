import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, MapPin, Navigation, Search, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { HustleActivity, HustleDirectory, HustleEvents } from '@typings/hustle';
import { BrowserDirectory, buildTabs, distanceLabel, inTab, matches } from './utils';

const ACCENT = '#16a34a';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-4">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
    <div className="mt-1 text-[15px] leading-snug">{children}</div>
  </section>
);

const Detail: React.FC<{
  activity: HustleActivity;
  onBack: () => void;
  onWaypoint: (activity: HustleActivity, step?: number) => void;
}> = ({ activity, onBack, onWaypoint }) => {
  const distance = distanceLabel(activity);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center px-2 pb-1 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-[17px]"
          style={{ color: ACCENT }}
        >
          <ChevronLeft size={26} /> Hustle
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <h1 className="sf-display text-[28px] font-bold leading-tight">{activity.label}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          {activity.seen && (
            <span className="flex items-center gap-1">
              <Check size={14} /> Found
            </span>
          )}
          {distance && <span>{distance}</span>}
        </p>

        {activity.waypoint && (
          <button
            type="button"
            onClick={() => onWaypoint(activity)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[15px] font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            <Navigation size={16} /> {activity.many ? 'Waypoint to the nearest one' : 'Set waypoint'}
          </button>
        )}

        <div className="mt-2 rounded-2xl bg-white px-4 pb-4 pt-1 shadow-sm dark:bg-neutral-800">
          <Section title="What it is">{activity.what}</Section>
          {activity.start && <Section title="How to start">{activity.start}</Section>}
          <Section title="You need">{activity.need}</Section>
          <Section title="You get">{activity.pays}</Section>
        </div>

        {activity.steps && activity.steps.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Step by step</h3>
            <ol className="mt-2 flex flex-col gap-3">
              {activity.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] leading-snug">
                    {step.text}
                    {step.waypoint && (
                      <button
                        type="button"
                        onClick={() => onWaypoint(activity, i + 1)}
                        className="mt-1 flex items-center gap-1 text-sm font-semibold"
                        style={{ color: ACCENT }}
                      >
                        <MapPin size={14} /> Waypoint
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export const HustleApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [dir, setDir] = useState<HustleDirectory | null>(null);
  const [tab, setTab] = useState<string>('start');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const resp = await fetchNui<HustleDirectory>(HustleEvents.FETCH, undefined, BrowserDirectory);
    setDir(resp && Array.isArray(resp.activities) ? resp : { ...BrowserDirectory, activities: [], error: 'Nothing to show.' });
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const tabs = useMemo(() => (dir ? buildTabs(dir.categories) : []), [dir]);

  // Searching looks through everything, not just the open tab: someone typing
  // "weed" should not have to know it lives under Crime.
  const shown = useMemo(() => {
    if (!dir) return [];
    return dir.activities.filter((a) =>
      query.trim() ? matches(a, query) : inTab(a, tab, dir.categories),
    );
  }, [dir, tab, query]);

  const waypoint = async (activity: HustleActivity, step?: number) => {
    const resp = await fetchNui<{ ok: boolean }>(HustleEvents.WAYPOINT, { id: activity.id, step }, { ok: true });
    addAlert(
      resp?.ok
        ? { message: step ? `Waypoint set for step ${step}.` : 'Waypoint set.', type: 'success' }
        : { message: 'Could not set a waypoint.', type: 'error' },
    );
  };

  if (!dir) {
    return (
      <AppWrapper id="hustle-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const open = openId ? dir.activities.find((a) => a.id === openId) : undefined;

  return (
    <AppWrapper id="hustle-app">
      <div className="flex flex-1 flex-col overflow-hidden bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        {open ? (
          <Detail activity={open} onBack={() => setOpenId(null)} onWaypoint={waypoint} />
        ) : (
          <>
            <header className="px-4 pb-2 pt-2">
              <h1 className="sf-display text-3xl font-bold">Hustle</h1>
              <p className="text-sm text-neutral-500">
                Ways to make money · {dir.found} of {dir.total} places found
              </p>

              <label className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-200/80 px-3 py-1.5 dark:bg-neutral-800">
                <Search size={16} className="shrink-0 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search: weed, gun, fishing..."
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-500"
                />
                {query && (
                  <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                    <X size={16} className="text-neutral-500" />
                  </button>
                )}
              </label>

              {!query.trim() && (
                <div className="hide-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                        tab === t.id ? 'text-white' : 'bg-white text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                      style={tab === t.id ? { backgroundColor: ACCENT } : undefined}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto px-4 pb-10">
              {dir.error && <p className="py-16 text-center text-sm text-neutral-500">{dir.error}</p>}
              {!dir.error && shown.length === 0 && (
                <p className="py-16 text-center text-sm text-neutral-500">Nothing matches that.</p>
              )}

              <div className="flex flex-col gap-2">
                {shown.map((activity) => {
                  const distance = distanceLabel(activity);
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => setOpenId(activity.id)}
                      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-neutral-800"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[15px] font-semibold">{activity.label}</span>
                          {activity.seen && <Check size={14} className="shrink-0" style={{ color: ACCENT }} />}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-neutral-500">
                          {activity.pays}
                        </span>
                        {distance && <span className="mt-1 block text-xs text-neutral-400">{distance}</span>}
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-neutral-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppWrapper>
  );
};
