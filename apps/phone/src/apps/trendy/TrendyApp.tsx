import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Plus, Trash2, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { ServerPromiseResp } from '@typings/common';
import { TRENDY_CAPTION_MAX, TrendyEvents, TrendyLikeResult, TrendyPost } from '@typings/trendy';
import { BrowserTrendy } from './utils';
import './trendy.css';

const POST_ERROR: Record<string, string> = {
  INVALID_MEDIA: 'That media host is not allowed.',
  TOO_SOON: 'Slow down — one post at a time.',
  NOT_FOUND: 'That post is gone.',
};

// Full-bleed vertical feed. Scroll snapping does the paging rather than a
// gesture handler, so a flick lands on exactly one post the way it should.
export const TrendyApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [posts, setPosts] = useState<TrendyPost[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [media, setMedia] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const resp = await fetchNui<ServerPromiseResp<TrendyPost[]>>(TrendyEvents.FETCH, undefined, {
      status: 'ok',
      data: BrowserTrendy,
    });
    setPosts(resp.status === 'ok' ? resp.data ?? [] : []);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const toggleLike = async (post: TrendyPost) => {
    setPosts((cur) =>
      cur?.map((p) =>
        p.id === post.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ) ?? cur,
    );

    const resp = await fetchNui<ServerPromiseResp<TrendyLikeResult>>(
      TrendyEvents.TOGGLE_LIKE,
      { id: post.id },
      { status: 'ok', data: { id: post.id, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } },
    );

    if (resp.status !== 'ok' || !resp.data) {
      setPosts((cur) => cur?.map((p) => (p.id === post.id ? post : p)) ?? cur);
      return;
    }
    const result = resp.data;
    setPosts((cur) =>
      cur?.map((p) => (p.id === result.id ? { ...p, liked: result.liked, likes: result.likes } : p)) ?? cur,
    );
  };

  const remove = async (post: TrendyPost) => {
    const resp = await fetchNui<ServerPromiseResp>(TrendyEvents.DELETE, { id: post.id }, { status: 'ok' });
    if (resp.status !== 'ok') {
      addAlert({ message: POST_ERROR[resp.errorMsg ?? ''] ?? 'Could not delete that.', type: 'error' });
      return;
    }
    setPosts((cur) => cur?.filter((p) => p.id !== post.id) ?? cur);
  };

  const create = async () => {
    setBusy(true);
    try {
      const resp = await fetchNui<ServerPromiseResp<TrendyPost>>(
        TrendyEvents.CREATE,
        { media, caption },
        { status: 'ok', data: { ...BrowserTrendy[0], id: Date.now(), media, caption, mine: true } },
      );

      if (resp.status !== 'ok' || !resp.data) {
        addAlert({ message: POST_ERROR[resp.errorMsg ?? ''] ?? 'Could not post that.', type: 'error' });
        return;
      }

      setPosts((cur) => [resp.data as TrendyPost, ...(cur ?? [])]);
      setComposing(false);
      setMedia('');
      setCaption('');
      feedRef.current?.scrollTo({ top: 0 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppWrapper id="trendy-app" fullBleed>
      <div className="relative flex flex-1 flex-col overflow-hidden bg-black text-white">
        {posts === null && <LoadingSpinner />}

        {posts?.length === 0 && (
          <p className="flex flex-1 items-center justify-center px-8 text-center text-sm text-neutral-400">
            Nothing trending yet. Post the first one.
          </p>
        )}

        <div ref={feedRef} className="trendy-feed flex-1 overflow-y-auto">
          {posts?.map((post) => (
            <section key={post.id} className="trendy-slide relative">
              {post.isVideo ? (
                <video
                  src={post.media}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img src={post.media} alt="" className="h-full w-full object-cover" />
              )}

              {/* Scrim so white text stays readable over a bright frame. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="absolute bottom-0 left-0 right-14 p-4">
                <p className="text-[15px] font-semibold">{post.authorName}</p>
                {post.caption && <p className="mt-1 text-sm leading-snug">{post.caption}</p>}
              </div>

              <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4">
                <button
                  type="button"
                  aria-label={post.liked ? 'Unlike' : 'Like'}
                  onClick={() => toggleLike(post)}
                  className="flex flex-col items-center gap-0.5"
                >
                  <Heart
                    size={30}
                    className={post.liked ? 'text-pink-500' : 'text-white'}
                    fill={post.liked ? 'currentColor' : 'none'}
                  />
                  <span className="text-xs font-semibold">{post.likes}</span>
                </button>

                {post.mine && (
                  <button type="button" aria-label="Delete" onClick={() => remove(post)}>
                    <Trash2 size={24} />
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>

        {!composing && (
          <button
            type="button"
            aria-label="New post"
            onClick={() => setComposing(true)}
            className="absolute right-4 top-14 rounded-full bg-white/20 p-2 backdrop-blur-md"
          >
            <Plus size={20} />
          </button>
        )}

        {composing && (
          <div className="absolute inset-0 z-20 flex flex-col bg-neutral-900 px-4 pb-8 pt-12">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setComposing(false)}
                className="rounded-full bg-white/15 p-1.5"
              >
                <X size={18} />
              </button>
              <span className="font-semibold">New post</span>
              <button
                type="button"
                disabled={!media.trim() || busy}
                onClick={create}
                className="rounded-full bg-pink-500 px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                Post
              </button>
            </div>

            <label className="text-sm text-neutral-400">Image or video link</label>
            <input
              value={media}
              onChange={(event) => setMedia(event.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-2xl bg-neutral-800 p-3 outline-none"
            />

            <label className="mt-3 text-sm text-neutral-400">Caption</label>
            <input
              value={caption}
              maxLength={TRENDY_CAPTION_MAX}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-1 w-full rounded-2xl bg-neutral-800 p-3 outline-none"
            />

            <p className="mt-3 text-xs text-neutral-500">
              Links must be on an allowed host. Videos (.mp4, .webm, .mov) autoplay and loop.
            </p>
          </div>
        )}
      </div>
    </AppWrapper>
  );
};
