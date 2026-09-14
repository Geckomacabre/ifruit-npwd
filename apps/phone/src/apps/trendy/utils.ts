import { TrendyPost } from '@typings/trendy';

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserTrendy: TrendyPost[] = [
  {
    id: 3,
    media: 'https://i.imgur.com/2nCt3Sbl.jpg',
    isVideo: false,
    caption: 'Nobody was on the road at 4am. Perfect run.',
    authorName: 'Marla Kane',
    mine: false,
    likes: 214,
    liked: false,
    createdAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: 2,
    media: 'https://i.imgur.com/2nCt3Sbl.jpg',
    isVideo: false,
    caption: 'New paint, who dis',
    authorName: 'You',
    mine: true,
    likes: 18,
    liked: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 1,
    media: 'https://i.imgur.com/2nCt3Sbl.jpg',
    isVideo: false,
    caption: '',
    authorName: 'Dwayne Ellis',
    mine: false,
    likes: 902,
    liked: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
  },
];
