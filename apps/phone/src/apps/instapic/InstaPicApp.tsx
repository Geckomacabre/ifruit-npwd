import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { ServerPromiseResp } from '@typings/common';
import { InstaPicEvents, InstaPicLikeResult, InstaPicPost } from '@typings/instapic';
import { ComposePost } from './components/ComposePost';
import { BrowserFeed, timeAgo } from './utils';

type Tab = 'feed' | 'mine';

const POST_ERROR: Record<string, string> = {
  INVALID_IMAGE: 'That image host is not allowed.',
  TOO_SOON: 'Slow down — one post at a time.',
  NOT_FOUND: 'That post is gone.',
};

export const InstaPicApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('feed');
  const [posts, setPosts] = useState<InstaPicPost[] | null>(null);
  const [composing, setComposing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (which: Tab) => {
    const event = which === 'feed' ? InstaPicEvents.FETCH : InstaPicEvents.FETCH_MINE;
    const mock = which === 'feed' ? BrowserFeed : BrowserFeed.filter((p) => p.mine);
    const resp = await fetchNui<ServerPromiseResp<InstaPicPost[]>>(event, undefined, {
      status: 'ok',
      data: mock,
    });
    setPosts(resp.status === 'ok' ? resp.data ?? [] : []);
  }, []);

  useEffect(() => {
    setPosts(null);
    load(tab).catch(console.error);
  }, [tab, load]);

  const toggleLike = async (post: InstaPicPost) => {
    // Optimistic: the heart should answer the tap, not the round trip.
    setPosts((cur) =>
      cur?.map((p) =>
        p.id === post.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ) ?? cur,
    );

    const resp = await fetchNui<ServerPromiseResp<InstaPicLikeResult>>(
      InstaPicEvents.TOGGLE_LIKE,
      { id: post.id },
      { status: 'ok', data: { id: post.id, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } },
    );

    if (resp.status !== 'ok' || !resp.data) {
      // Put it back the way it was.
      setPosts((cur) => cur?.map((p) => (p.id === post.id ? post : p)) ?? cur);
      return;
    }

    const result = resp.data;
    setPosts((cur) =>
      cur?.map((p) => (p.id === result.id ? { ...p, liked: result.liked, likes: result.likes } : p)) ?? cur,
    );
  };

  const remove = async (post: InstaPicPost) => {
    const resp = await fetchNui<ServerPromiseResp>(InstaPicEvents.DELETE, { id: post.id }, { status: 'ok' });
    if (resp.status !== 'ok') {
      addAlert({ message: POST_ERROR[resp.errorMsg ?? ''] ?? 'Could not delete that.', type: 'error' });
      return;
    }
    setPosts((cur) => cur?.filter((p) => p.id !== post.id) ?? cur);
  };

  const create = async (image: string, caption: string) => {
    setBusy(true);
    try {
      const resp = await fetchNui<ServerPromiseResp<InstaPicPost>>(
        InstaPicEvents.CREATE,
        { image, caption },
        { status: 'ok', data: { ...BrowserFeed[0], id: Date.now(), image, caption, mine: true } },
      );

      if (resp.status !== 'ok' || !resp.data) {
        addAlert({ message: POST_ERROR[resp.errorMsg ?? ''] ?? 'Could not post that.', type: 'error' });
        return;
      }

      setPosts((cur) => [resp.data as InstaPicPost, ...(cur ?? [])]);
      setComposing(false);
      addAlert({ message: 'Posted.', type: 'success' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppWrapper id="instapic-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">InstaPic</h1>
          <button
            type="button"
            aria-label="New post"
            onClick={() => setComposing(true)}
            className="rounded-full bg-pink-500 p-2 text-white"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="flex gap-1 px-4 pb-3">
          {(['feed', 'mine'] as Tab[]).map((key) => (
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
              {key === 'feed' ? 'Feed' : 'My posts'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {posts === null && <LoadingSpinner />}
          {posts?.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-500">
              {tab === 'feed' ? 'Nothing posted yet.' : "You haven't posted anything."}
            </p>
          )}

          <div className="flex flex-col gap-4">
            {posts?.map((post) => (
              <div key={post.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="truncate text-sm font-semibold">{post.authorName}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{timeAgo(post.createdAt)}</span>
                </div>

                <img src={post.image} alt="" className="max-h-72 w-full object-cover" />

                <div className="flex items-center gap-3 px-3 py-2">
                  <button
                    type="button"
                    aria-label={post.liked ? 'Unlike' : 'Like'}
                    onClick={() => toggleLike(post)}
                    className={cn('flex items-center gap-1 text-sm', post.liked && 'text-pink-500')}
                  >
                    <Heart size={19} fill={post.liked ? 'currentColor' : 'none'} />
                    {post.likes > 0 && post.likes}
                  </button>

                  {post.mine && (
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => remove(post)}
                      className="ml-auto text-neutral-400"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>

                {post.caption && (
                  <p className="px-3 pb-3 text-sm">
                    <span className="font-semibold">{post.authorName}</span> {post.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {composing && (
          <ComposePost busy={busy} onClose={() => setComposing(false)} onPost={create} />
        )}
      </div>
    </AppWrapper>
  );
};
