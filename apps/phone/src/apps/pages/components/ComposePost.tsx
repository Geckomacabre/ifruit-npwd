import React, { useState } from 'react';
import fetchNui from '@utils/fetchNui';
import { NPWDInput, NPWDTextarea } from '@ui/components/Input';
import { ServerPromiseResp } from '@typings/common';
import { PAGES_DESCRIPTION_MAX, PAGES_TITLE_MAX, PagesEvents, PagesPost } from '@typings/pages';
import { pagesErrorText } from '../utils';

interface ComposePostProps {
  onClose: () => void;
  onPosted: (post: PagesPost) => void;
}

const LABEL = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500';

export const ComposePost: React.FC<ComposePostProps> = ({ onClose, onPosted }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    if (posting) return;
    setError(null);
    setPosting(true);

    try {
      const resp = await fetchNui<ServerPromiseResp<PagesPost>>(
        PagesEvents.CREATE,
        { title, description, image, price: price === '' ? null : Number(price) },
        {
          status: 'ok',
          data: {
            id: Date.now(),
            title,
            description,
            image: image || null,
            price: price === '' ? null : Number(price),
            phoneNumber: '5550199',
            authorName: 'Johnny Klebitz',
            mine: true,
            createdAt: Date.now(),
          },
        },
      );

      if (resp.status !== 'ok') return setError(pagesErrorText(resp.errorMsg));
      onPosted(resp.data);
    } catch (e) {
      setError(pagesErrorText());
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-neutral-100 pt-12 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <header className="flex items-center justify-between px-4 pb-3">
        <button type="button" onClick={onClose} className="text-amber-500">
          Cancel
        </button>
        <h2 className="font-semibold">New Ad</h2>
        <button
          type="button"
          onClick={submit}
          disabled={posting || title.trim().length < 3 || !description.trim()}
          className="font-semibold text-amber-500 disabled:opacity-40"
        >
          {posting ? 'Posting…' : 'Post'}
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-10">
        <label className="block">
          <span className={LABEL}>Title</span>
          <NPWDInput value={title} maxLength={PAGES_TITLE_MAX} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="block">
          <span className={LABEL}>Price (optional)</span>
          <NPWDInput
            type="number"
            min={0}
            placeholder="Leave empty for no price, 0 for free"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>
        <label className="block">
          <span className={LABEL}>Image link (optional)</span>
          <NPWDInput placeholder="https://i.imgur.com/..." value={image} onChange={(event) => setImage(event.target.value)} />
        </label>
        <label className="block">
          <span className={LABEL}>Description</span>
          <NPWDTextarea
            rows={7}
            maxLength={PAGES_DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="resize-none"
          />
        </label>

        {error && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};
