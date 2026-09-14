import React, { useEffect, useState } from 'react';
import { MapPin, Star, X } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { GeoCache, GeoCacheDetail, GeoCacheEvents, GeoCacheResult } from '@typings/geocache';
import { BrowserDetail } from '../utils';

interface CacheDetailProps {
  cache: GeoCache;
  onClose: () => void;
  onLocate: (cache: GeoCache) => void;
}

export const CacheDetail: React.FC<CacheDetailProps> = ({ cache, onClose, onLocate }) => {
  const { addAlert } = useSnackbar();
  const [detail, setDetail] = useState<GeoCacheDetail | null>(null);
  const [comment, setComment] = useState('');

  const load = () =>
    fetchNui<GeoCacheDetail>(
      GeoCacheEvents.GET_DETAIL,
      { cacheId: cache.id, cacheType: cache.type },
      BrowserDetail,
    )
      .then(setDetail)
      .catch(console.error);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.id, cache.type]);

  const rate = async (stars: number) => {
    const result = await fetchNui<GeoCacheResult>(
      GeoCacheEvents.RATE,
      { cacheId: cache.id, cacheType: cache.type, stars },
      { ok: true },
    );
    if (!result?.ok) {
      addAlert({ message: result?.message ?? 'Could not rate that.', type: 'error' });
      return;
    }
    await load();
  };

  const send = async () => {
    if (!comment.trim()) return;
    const result = await fetchNui<GeoCacheResult>(
      GeoCacheEvents.COMMENT,
      { cacheId: cache.id, cacheType: cache.type, text: comment },
      { ok: true },
    );
    if (!result?.ok) {
      addAlert({ message: result?.message ?? 'Could not post that.', type: 'error' });
      return;
    }
    setComment('');
    await load();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="max-h-[88%] overflow-y-auto rounded-t-[28px] bg-neutral-100 px-5 pb-10 pt-3 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-400/60" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{cache.name}</h2>
            <p className="text-sm text-neutral-500">by {cache.submitter}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        <p className="rounded-2xl bg-white p-3 text-sm dark:bg-neutral-800">{cache.clue}</p>

        <button
          type="button"
          onClick={() => onLocate(cache)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white"
        >
          <MapPin size={16} /> Show the clue again
        </button>

        <p className="mt-4 text-sm font-semibold text-neutral-500">
          Rate it
          {detail && detail.rating_count > 0 && (
            <span className="ml-1 font-normal">
              ({detail.avg_rating.toFixed(1)} from {detail.rating_count})
            </span>
          )}
        </p>
        <div className="mt-1 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} stars`}
              onClick={() => rate(n)}
              className="flex-1 rounded-xl bg-white py-2 dark:bg-neutral-800"
            >
              <Star
                size={16}
                className="mx-auto text-amber-400"
                fill={detail && detail.avg_rating >= n ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm font-semibold text-neutral-500">Logbook</p>
        <div className="mt-1 flex gap-2">
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Leave a note"
            className="min-w-0 flex-1 rounded-2xl bg-white p-3 text-sm outline-none dark:bg-neutral-800"
          />
          <button
            type="button"
            disabled={!comment.trim()}
            onClick={send}
            className="shrink-0 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Post
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {detail?.comments.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-500">Nobody has signed this one.</p>
          )}
          {detail?.comments.map((entry, i) => (
            <div key={i} className="rounded-2xl bg-white p-3 dark:bg-neutral-800">
              <p className="text-sm font-semibold">{entry.player_name}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
