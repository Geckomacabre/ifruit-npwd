import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { GalleryPhoto, PhotoEvents } from '@typings/photo';
import { INSTAPIC_CAPTION_MAX } from '@typings/instapic';
import { cn } from '@utils/css';

interface ComposePostProps {
  busy: boolean;
  onClose: () => void;
  onPost: (image: string, caption: string) => void;
}

// Pictures come from the phone's own camera roll rather than a URL box: the
// server only accepts images from the configured hosts anyway, and anything
// the player photographed is already uploaded to one of them.
export const ComposePost: React.FC<ComposePostProps> = ({ busy, onClose, onPost }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    fetchNui<ServerPromiseResp<GalleryPhoto[]>>(PhotoEvents.FETCH_PHOTOS, undefined, {
      status: 'ok',
      data: [
        { id: 1, image: 'https://i.imgur.com/2nCt3Sbl.jpg' },
        { id: 2, image: 'https://i.imgur.com/2nCt3Sbl.jpg' },
        { id: 3, image: 'https://i.imgur.com/2nCt3Sbl.jpg' },
      ],
    })
      .then((resp) => setPhotos(resp.status === 'ok' ? resp.data ?? [] : []))
      .catch(() => setPhotos([]));
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-neutral-100 dark:bg-neutral-900">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800">
          <X size={18} />
        </button>
        <span className="font-semibold">New post</span>
        <button
          type="button"
          disabled={!picked || busy}
          onClick={() => picked && onPost(picked, caption)}
          className="rounded-full bg-pink-500 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Share
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {picked && <img src={picked} alt="" className="mb-3 max-h-56 w-full rounded-2xl object-cover" />}

        <input
          value={caption}
          maxLength={INSTAPIC_CAPTION_MAX}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Write a caption"
          className="mb-4 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
        />

        <p className="mb-2 text-sm font-semibold text-neutral-500">Camera roll</p>
        {photos === null && <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>}
        {photos?.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500">
            No photos yet — take one with the Camera app.
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {photos?.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setPicked(photo.image)}
              className={cn(
                'aspect-square overflow-hidden rounded-xl',
                picked === photo.image && 'ring-2 ring-pink-500',
              )}
            >
              <img src={photo.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
