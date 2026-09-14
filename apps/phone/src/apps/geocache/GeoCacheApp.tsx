import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Plus, Star, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { NPWDSearchInput } from '@ui/components/Input';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { GeoCache, GeoCacheEvents, GeoCacheResult, GeoCacheStats } from '@typings/geocache';
import { CacheDetail } from './components/CacheDetail';
import { BrowserCaches, BrowserStats } from './utils';

type Tab = 'browse' | 'stats';

export const GeoCacheApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('browse');
  const [caches, setCaches] = useState<GeoCache[] | null>(null);
  const [stats, setStats] = useState<GeoCacheStats | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GeoCache | null>(null);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: '', clue: '', difficulty: 3 });

  const load = useCallback(async () => {
    const [list, myStats] = await Promise.all([
      fetchNui<GeoCache[]>(GeoCacheEvents.GET_CACHES, undefined, BrowserCaches),
      fetchNui<GeoCacheStats>(GeoCacheEvents.GET_STATS, undefined, BrowserStats),
    ]);
    setCaches(Array.isArray(list) ? list : []);
    setStats(myStats ?? null);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const locate = async (cache: GeoCache) => {
    // The app never hands out the exact spot -- the clue is the game. This is
    // the same rounding the old UI used for its map pin.
    addAlert({ message: `${cache.name}: ${cache.clue}`, type: 'info' });
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setPlacing(false);

    const result = await fetchNui<GeoCacheResult>(
      GeoCacheEvents.START_PLACEMENT,
      form,
      { ok: true, message: 'Cache submitted for review.' },
    );

    addAlert({
      message: result?.message ?? (result?.ok ? 'Cache submitted.' : 'Placement failed.'),
      type: result?.ok ? 'success' : 'error',
    });

    if (result?.ok) {
      setForm({ name: '', clue: '', difficulty: 3 });
      await load();
    }
  };

  const visible = (caches ?? []).filter((cache) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [cache.name, cache.clue, cache.submitter].some((f) => f.toLowerCase().includes(query));
  });

  return (
    <AppWrapper id="geocache-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">GeoCache</h1>
          <button
            type="button"
            aria-label="Hide a cache"
            onClick={() => setPlacing(true)}
            className="rounded-full bg-emerald-600 p-2 text-white"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="flex gap-1 px-4 pb-3">
          {(['browse', 'stats'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 rounded-full py-1.5 text-[13px] font-semibold capitalize transition-colors',
                tab === key
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                  : 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <div className="px-4 pb-3">
            <NPWDSearchInput
              placeholder="Search caches"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {caches === null && <LoadingSpinner />}

          {tab === 'stats' && stats && (
            <>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-neutral-800">
                  <p className="text-3xl font-bold">{stats.found}</p>
                  <p className="text-sm text-neutral-500">Found</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-neutral-800">
                  <p className="text-3xl font-bold">{stats.submitted}</p>
                  <p className="text-sm text-neutral-500">Hidden by you</p>
                </div>
              </div>

              <h2 className="mb-2 text-sm font-semibold text-neutral-500">Recently found</h2>
              {stats.recent.length === 0 && (
                <p className="py-6 text-center text-sm text-neutral-500">Nothing yet.</p>
              )}
              <div className="flex flex-col gap-2">
                {stats.recent.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-white p-3 text-sm shadow-sm dark:bg-neutral-800">
                    {entry.label}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'browse' && (
            <div className="flex flex-col gap-3">
              {caches !== null && visible.length === 0 && (
                <p className="py-16 text-center text-sm text-neutral-500">No caches match that.</p>
              )}

              {visible.map((cache) => (
                <button
                  type="button"
                  key={`${cache.type}-${cache.id}`}
                  onClick={() => setSelected(cache)}
                  className="rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-neutral-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{cache.name}</span>
                      <span className="text-xs text-neutral-500">by {cache.submitter}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm">
                      <Star size={13} fill="currentColor" strokeWidth={0} className="text-amber-400" />
                      {cache.avg_rating ? cache.avg_rating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                    {cache.clue}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Difficulty {cache.difficulty}/5 · {cache.type === 'world' ? 'Official' : 'Player hidden'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <CacheDetail cache={selected} onClose={() => setSelected(null)} onLocate={locate} />
        )}

        {placing && (
          <div className="absolute inset-0 z-20 flex flex-col bg-neutral-100 px-4 pb-8 pt-12 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPlacing(false)}
                className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800"
              >
                <X size={18} />
              </button>
              <span className="font-semibold">Hide a cache</span>
              <button
                type="button"
                disabled={!form.name.trim()}
                onClick={submit}
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Place
              </button>
            </div>

            <label className="text-sm text-neutral-500">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <label className="mt-3 text-sm text-neutral-500">Clue</label>
            <input
              value={form.clue}
              onChange={(event) => setForm({ ...form, clue: event.target.value })}
              placeholder="Where should people look?"
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <label className="mt-3 text-sm text-neutral-500">Difficulty {form.difficulty}/5</label>
            <input
              type="range"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: Number(event.target.value) })}
              className="mt-1 w-full accent-emerald-600"
            />

            <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              The phone closes so you can place the box with the arrow keys. E confirms, Esc cancels.
            </p>
          </div>
        )}
      </div>
    </AppWrapper>
  );
};
