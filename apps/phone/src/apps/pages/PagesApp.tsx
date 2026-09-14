import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { NPWDSearchInput } from '@ui/components/Input';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { ServerPromiseResp } from '@typings/common';
import { PagesEvents, PagesPost } from '@typings/pages';
import { PostDetail } from './components/PostDetail';
import { ComposePost } from './components/ComposePost';
import { BrowserPosts, formatPostedAt, formatPrice } from './utils';

export const PagesApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [posts, setPosts] = useState<PagesPost[] | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PagesPost | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    fetchNui<ServerPromiseResp<PagesPost[]>>(PagesEvents.FETCH, undefined, { status: 'ok', data: BrowserPosts })
      .then((resp) => setPosts(resp.status === 'ok' ? resp.data : []))
      .catch((e) => {
        console.error(e);
        setPosts([]);
      });
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!posts || !query) return posts;
    return posts.filter((post) =>
      [post.title, post.description, post.authorName].some((field) => field.toLowerCase().includes(query)),
    );
  }, [posts, search]);

  const remove = async (post: PagesPost) => {
    const resp = await fetchNui<ServerPromiseResp>(PagesEvents.DELETE, { id: post.id }, { status: 'ok' });
    if (resp.status !== 'ok') return addAlert({ message: 'Could not delete that ad.', type: 'error' });

    setPosts((current) => current?.filter((p) => p.id !== post.id) ?? current);
    setSelected(null);
    addAlert({ message: 'Ad deleted.', type: 'success' });
  };

  return (
    <AppWrapper id="pages-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">Pages</h1>
          <button
            type="button"
            aria-label="New ad"
            onClick={() => setComposing(true)}
            className="rounded-full bg-amber-500 p-2 text-white"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="px-4 pb-3">
          <NPWDSearchInput placeholder="Search ads" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {visible === null && <LoadingSpinner />}
          {visible?.length === 0 && (
            <p className="py-16 text-center text-neutral-500">
              {search ? 'No ads match that.' : 'No ads yet. Post the first one.'}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {visible?.map((post) => {
              const price = formatPrice(post.price);
              return (
                <button
                  type="button"
                  key={post.id}
                  onClick={() => setSelected(post)}
                  className="flex gap-3 rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-neutral-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{post.title}</p>
                    {price && <p className="text-sm font-semibold text-amber-500">{price}</p>}
                    <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">{post.description}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {post.mine ? 'Your ad' : post.authorName} · {formatPostedAt(post.createdAt)}
                    </p>
                  </div>
                  {post.image && <img src={post.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                </button>
              );
            })}
          </div>
        </div>

        {selected && <PostDetail post={selected} onClose={() => setSelected(null)} onDelete={remove} />}
        {composing && (
          <ComposePost
            onClose={() => setComposing(false)}
            onPosted={(post) => {
              setPosts((current) => [post, ...(current ?? [])]);
              setComposing(false);
              addAlert({ message: 'Your ad is live.', type: 'success' });
            }}
          />
        )}
      </div>
    </AppWrapper>
  );
};
