import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Lock, MessageCircle, Plus, Users, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import {
  LonelyCreator,
  LonelyEvents,
  LonelyPost,
  LonelyProfile,
  LonelyResult,
} from '@typings/lonely';
import { BrowserCreators, BrowserFeed, BrowserProfile, money } from './utils';

type Tab = 'feed' | 'creators' | 'me';

export const LonelyApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [tab, setTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<LonelyPost[] | null>(null);
  const [creators, setCreators] = useState<LonelyCreator[] | null>(null);
  const [profile, setProfile] = useState<LonelyProfile | null>(null);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ caption: '', mediaUrl: '', unlockPrice: 0 });

  const load = useCallback(async () => {
    const [f, c, p] = await Promise.all([
      fetchNui<LonelyPost[]>(LonelyEvents.GET_FEED, undefined, BrowserFeed),
      fetchNui<LonelyCreator[]>(LonelyEvents.GET_CREATORS, undefined, BrowserCreators),
      fetchNui<LonelyProfile>(LonelyEvents.GET_MY_PROFILE, undefined, BrowserProfile),
    ]);
    setFeed(Array.isArray(f) ? f : []);
    setCreators(Array.isArray(c) ? c : []);
    setProfile(p ?? null);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const run = async (event: LonelyEvents, payload?: unknown, okMessage?: string) => {
    const result = await fetchNui<LonelyResult>(event, payload, { success: true });
    const ok = result?.success ?? result?.ok ?? false;

    if (!ok) {
      addAlert({ message: result?.message ?? 'That did not work.', type: 'error' });
      return false;
    }
    if (okMessage) addAlert({ message: okMessage, type: 'success' });
    await load();
    return true;
  };

  const post = async () => {
    if (!form.mediaUrl.trim()) return;
    if (await run(LonelyEvents.CREATE_POST, form, 'Posted.')) {
      setForm({ caption: '', mediaUrl: '', unlockPrice: 0 });
      setPosting(false);
    }
  };

  if (feed === null) {
    return (
      <AppWrapper id="lonely-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper id="lonely-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">LonelyMans</h1>
          {profile?.display_name && (
            <button
              type="button"
              aria-label="New post"
              onClick={() => setPosting(true)}
              className="rounded-full bg-sky-500 p-2 text-white"
            >
              <Plus size={20} />
            </button>
          )}
        </header>

        <div className="flex gap-1 px-4 pb-3">
          {(['feed', 'creators', 'me'] as Tab[]).map((key) => (
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

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {tab === 'feed' && (
            <div className="flex flex-col gap-4">
              {feed.length === 0 && (
                <p className="py-16 text-center text-sm text-neutral-500">
                  Nothing here yet. Subscribe to a creator.
                </p>
              )}

              {feed.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
                      {item.creator_pic && <img src={item.creator_pic} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="truncate text-sm font-semibold">{item.creator_name}</span>
                  </div>

                  {item.is_unlocked ? (
                    item.media_url && (
                      <img src={item.media_url} alt="" className="max-h-72 w-full object-cover" />
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        run(LonelyEvents.UNLOCK_POST, { postId: item.id }, 'Unlocked.')
                      }
                      className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-neutral-200 dark:bg-neutral-700"
                    >
                      <Lock size={26} />
                      <span className="text-sm font-semibold">
                        Unlock for {money(item.unlock_price)}
                      </span>
                    </button>
                  )}

                  <div className="flex items-center gap-3 px-3 py-2 text-sm">
                    <button
                      type="button"
                      onClick={() => run(LonelyEvents.TOGGLE_LIKE, { postId: item.id })}
                      className={cn('flex items-center gap-1', item.is_liked && 'text-pink-500')}
                    >
                      <Heart size={18} fill={item.is_liked ? 'currentColor' : 'none'} />
                      {item.like_count}
                    </button>
                    <span className="flex items-center gap-1 text-neutral-500">
                      <MessageCircle size={18} />
                      {item.comment_count}
                    </span>
                  </div>

                  {item.caption && <p className="px-3 pb-3 text-sm">{item.caption}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'creators' && (
            <div className="flex flex-col gap-3">
              {(creators ?? []).length === 0 && (
                <p className="py-16 text-center text-sm text-neutral-500">No creators yet.</p>
              )}

              {(creators ?? []).map((creator) => (
                <div
                  key={creator.citizenid}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-600">
                    {creator.profile_pic && (
                      <img src={creator.profile_pic} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{creator.display_name}</span>
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <Users size={12} />
                      {creator.sub_count} · {creator.post_count} posts
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={!!creator.is_subscribed}
                    onClick={() =>
                      run(LonelyEvents.SUBSCRIBE, { creatorId: creator.citizenid }, 'Subscribed.')
                    }
                    className="shrink-0 rounded-full bg-sky-500 px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
                  >
                    {creator.is_subscribed ? 'Subscribed' : `${money(creator.sub_price)}/mo`}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'me' && (
            <>
              {profile?.display_name ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                  <p className="text-lg font-semibold">{profile.display_name}</p>
                  {profile.bio && <p className="mt-1 text-sm text-neutral-500">{profile.bio}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold">{money(profile.sub_price ?? 0)}</p>
                      <p className="text-xs text-neutral-500">Per month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{money(profile.earnings ?? 0)}</p>
                      <p className="text-xs text-neutral-500">Earned</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-neutral-800">
                  <p className="font-semibold">You are not a creator yet</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Set up a page to start charging for posts.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      run(
                        LonelyEvents.CREATE_PROFILE,
                        { displayName: 'New creator', bio: '', subPrice: 100 },
                        'Page created.',
                      )
                    }
                    className="mt-3 w-full rounded-full bg-sky-500 py-2 text-sm font-semibold text-white"
                  >
                    Create my page
                  </button>
                </div>
              )}
            </>
          )}
        </div>

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
              <span className="font-semibold">New post</span>
              <button
                type="button"
                disabled={!form.mediaUrl.trim()}
                onClick={post}
                className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Post
              </button>
            </div>

            <label className="text-sm text-neutral-500">Media link</label>
            <input
              value={form.mediaUrl}
              onChange={(event) => setForm({ ...form, mediaUrl: event.target.value })}
              placeholder="https://…"
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <label className="mt-3 text-sm text-neutral-500">Caption</label>
            <input
              value={form.caption}
              onChange={(event) => setForm({ ...form, caption: event.target.value })}
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />

            <label className="mt-3 text-sm text-neutral-500">
              Unlock price — 0 means free to subscribers
            </label>
            <input
              type="number"
              value={form.unlockPrice}
              onChange={(event) => setForm({ ...form, unlockPrice: Number(event.target.value) })}
              className="mt-1 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
            />
          </div>
        )}
      </div>
    </AppWrapper>
  );
};
