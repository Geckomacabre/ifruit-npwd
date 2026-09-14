import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MessageCircle, Phone, Trash2, X } from 'lucide-react';
import { cn } from '@utils/css';
import { useCall } from '@os/call/hooks/useCall';
import { PagesPost } from '@typings/pages';
import { formatPostedAt, formatPrice } from '../utils';

interface PostDetailProps {
  post: PagesPost;
  onClose: () => void;
  onDelete: (post: PagesPost) => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onClose, onDelete }) => {
  const history = useHistory();
  const { initializeCall } = useCall();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const price = formatPrice(post.price);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85%] overflow-y-auto rounded-t-[28px] bg-neutral-100 px-5 pb-10 pt-3 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-400/60" />
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold leading-tight">{post.title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800">
            <X size={18} />
          </button>
        </div>

        {post.image && <img src={post.image} alt="" className="mb-4 max-h-56 w-full rounded-2xl object-cover" />}

        {price && <p className="mb-2 text-xl font-semibold text-amber-500">{price}</p>}
        <p className="whitespace-pre-wrap break-words leading-relaxed">{post.description}</p>
        <p className="mt-4 text-sm text-neutral-500">
          {post.authorName} · {formatPostedAt(post.createdAt)}
        </p>

        {post.mine ? (
          <button
            type="button"
            onClick={() => (confirmDelete ? onDelete(post) : setConfirmDelete(true))}
            className={cn(
              'mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold',
              confirmDelete ? 'bg-red-500 text-white' : 'bg-neutral-200 text-red-500 dark:bg-neutral-800',
            )}
          >
            <Trash2 size={18} /> {confirmDelete ? 'Tap again to delete' : 'Delete ad'}
          </button>
        ) : (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => initializeCall(post.phoneNumber)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 py-3 font-semibold text-white"
            >
              <Phone size={18} /> Call
            </button>
            <button
              type="button"
              onClick={() => history.push(`/messages/new?phoneNumber=${post.phoneNumber}`)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3 font-semibold text-white"
            >
              <MessageCircle size={18} /> Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
