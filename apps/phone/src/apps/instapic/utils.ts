import { InstaPicPost } from '@typings/instapic';

export const timeAgo = (ts: number): string => {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserFeed: InstaPicPost[] = [
  {
    id: 3,
    image: 'https://i.imgur.com/2nCt3Sbl.jpg',
    caption: 'Sunset off Vespucci. Worth the drive.',
    authorName: 'Marla Kane',
    mine: false,
    likes: 12,
    liked: false,
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: 2,
    image: 'https://i.imgur.com/2nCt3Sbl.jpg',
    caption: 'New paint.',
    authorName: 'You',
    mine: true,
    likes: 4,
    liked: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 1,
    image: 'https://i.imgur.com/2nCt3Sbl.jpg',
    caption: '',
    authorName: 'Dwayne Ellis',
    mine: false,
    likes: 31,
    liked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
  },
];
