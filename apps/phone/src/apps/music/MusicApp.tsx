import React, { useCallback, useEffect, useState } from 'react';
import { Ear, Pause, Play, Plus, Speaker, Square, Trash2, Volume2, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { MusicEvents, MusicMode, MusicResult, MusicState, MusicTrack } from '@typings/music';
import { BrowserMusic } from './utils';

export const MusicApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [state, setState] = useState<MusicState | null>(null);
  const [mode, setMode] = useState<MusicMode>('earbuds');
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const load = useCallback(async () => {
    const resp = await fetchNui<MusicState>(MusicEvents.FETCH, undefined, BrowserMusic);
    setState(resp ?? { tracks: [], current: null });
    if (resp?.current) setMode(resp.current.mode);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const apply = (result: MusicResult | null) => {
    if (!result?.ok) {
      if (result?.message) addAlert({ message: result.message, type: 'error' });
      return false;
    }
    if (result.current !== undefined) {
      setState((cur) => (cur ? { ...cur, current: result.current ?? null } : cur));
    }
    return true;
  };

  const play = async (track: MusicTrack) => {
    const result = await fetchNui<MusicResult>(
      MusicEvents.PLAY,
      { ...track, mode, volume: state?.current?.volume ?? 0.5 },
      { ok: true, current: { ...track, mode, volume: 0.5, paused: false } },
    );
    apply(result);
  };

  const stop = async () => {
    await fetchNui<MusicResult>(MusicEvents.STOP, undefined, { ok: true });
    setState((cur) => (cur ? { ...cur, current: null } : cur));
  };

  const togglePause = async () => {
    const current = state?.current;
    if (!current) return;
    apply(
      await fetchNui<MusicResult>(MusicEvents.TOGGLE_PAUSE, undefined, {
        ok: true,
        current: { ...current, paused: !current.paused },
      }),
    );
  };

  const setVolume = async (volume: number) => {
    const current = state?.current;
    if (!current) return;
    // Optimistic so the slider tracks the finger, not the round trip.
    setState((cur) => (cur?.current ? { ...cur, current: { ...cur.current, volume } } : cur));
    await fetchNui<MusicResult>(MusicEvents.SET_VOLUME, { volume }, { ok: true });
  };

  const addTrack = async () => {
    const resp = await fetchNui<MusicResult>(
      MusicEvents.ADD,
      { title, url },
      { ok: true },
    );

    if (!resp?.ok) {
      addAlert({ message: 'That link was rejected — it must be an https link.', type: 'error' });
      return;
    }

    setTitle('');
    setUrl('');
    setAdding(false);
    await load();
  };

  const remove = async (track: MusicTrack) => {
    await fetchNui<MusicResult>(MusicEvents.REMOVE, { id: track.id }, { ok: true });
    await load();
  };

  if (!state) {
    return (
      <AppWrapper id="music-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const current = state.current;

  return (
    <AppWrapper id="music-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">Music</h1>
          <button
            type="button"
            aria-label="Add track"
            onClick={() => setAdding(true)}
            className="rounded-full bg-red-500 p-2 text-white"
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Where the sound comes out. Speaker is audible to anyone nearby, so
            it is a deliberate choice rather than a default. */}
        <div className="mx-4 mb-3 flex gap-1 rounded-full bg-neutral-200 p-1 dark:bg-neutral-800">
          {(['earbuds', 'speaker'] as MusicMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-[13px] font-semibold capitalize',
                mode === option && 'bg-white text-black shadow dark:bg-neutral-600 dark:text-white',
              )}
            >
              {option === 'earbuds' ? <Ear size={15} /> : <Speaker size={15} />}
              {option}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {state.tracks.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-500">
              No tracks yet. Add a direct link to an audio file.
            </p>
          )}

          <div className="flex flex-col gap-2">
            {state.tracks.map((track) => {
              const playing = current?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800',
                    playing && 'ring-2 ring-red-500',
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Play ${track.title}`}
                    onClick={() => play(track)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <Play size={17} fill="currentColor" strokeWidth={0} />
                  </button>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{track.title}</span>
                    <span className="block truncate text-xs text-neutral-500">{track.url}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${track.title}`}
                    onClick={() => remove(track)}
                    className="shrink-0 text-neutral-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {current && (
          <div className="border-t border-neutral-200 bg-white px-4 pb-5 pt-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{current.title}</span>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  {current.mode === 'speaker' ? <Speaker size={12} /> : <Ear size={12} />}
                  {current.mode === 'speaker' ? 'Playing out loud' : 'Earbuds'}
                </span>
              </span>

              {current.mode === 'earbuds' && (
                <button
                  type="button"
                  aria-label={current.paused ? 'Resume' : 'Pause'}
                  onClick={togglePause}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
                >
                  {current.paused ? (
                    <Play size={17} fill="currentColor" strokeWidth={0} />
                  ) : (
                    <Pause size={17} fill="currentColor" strokeWidth={0} />
                  )}
                </button>
              )}

              <button
                type="button"
                aria-label="Stop"
                onClick={stop}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700"
              >
                <Square size={15} fill="currentColor" strokeWidth={0} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Volume2 size={16} className="shrink-0 text-neutral-500" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(current.volume * 100)}
                onChange={(event) => setVolume(Number(event.target.value) / 100)}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        )}

        {adding && (
          <div className="absolute inset-0 z-20 flex flex-col bg-neutral-100 px-4 pb-8 pt-12 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAdding(false)}
                className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800"
              >
                <X size={18} />
              </button>
              <span className="font-semibold">Add track</span>
              <button
                type="button"
                disabled={!url.trim()}
                onClick={addTrack}
                className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <label className="text-sm text-neutral-500">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Untitled"
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <label className="mt-3 text-sm text-neutral-500">Link</label>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <p className="mt-3 text-xs text-neutral-500">
              A direct https link to an audio file. Speaker mode plays it where you are standing, so
              anyone nearby will hear it.
            </p>
          </div>
        )}
      </div>
    </AppWrapper>
  );
};
