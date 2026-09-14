import dayjs from 'dayjs';
import { PagesError, PagesPost } from '@typings/pages';

const ERRORS: Record<PagesError, string> = {
  INVALID_TITLE: 'Give your ad a title (at least 3 characters).',
  INVALID_DESCRIPTION: 'Describe what you are offering.',
  INVALID_IMAGE: "That image host isn't allowed. Try Imgur or Fivemanage.",
  INVALID_PRICE: 'Enter a price between $0 and $100,000,000, or leave it empty.',
  TOO_SOON: 'You just posted. Wait a minute before posting again.',
};

export const pagesErrorText = (code?: string): string => ERRORS[code as PagesError] ?? 'Could not post that ad.';

export const formatPrice = (price: number | null): string | null =>
  price === null ? null : price === 0 ? 'Free' : `$${price.toLocaleString('en-US')}`;

export const formatPostedAt = (timestamp: number): string => {
  const time = dayjs(timestamp);
  const minutes = dayjs().diff(time, 'minute');
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return time.format('MMM D');
};

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserPosts: PagesPost[] = [
  {
    id: 4,
    title: 'Hayes Auto — same-day repairs',
    description:
      'Engine, body and tire work. We come to you anywhere in Los Santos. Call or text for a quote, open late most nights.',
    image: null,
    price: null,
    phoneNumber: '5550142',
    authorName: 'Terry Thorpe',
    mine: false,
    createdAt: Date.now() - 1200e3,
  },
  {
    id: 3,
    title: 'Private security for events',
    description: 'Licensed, discreet, and armed if the client wants it. Parties, meetings, deliveries.',
    image: null,
    price: 2500,
    phoneNumber: '5550199',
    authorName: 'Johnny Klebitz',
    mine: true,
    createdAt: Date.now() - 7200e3,
  },
  {
    id: 2,
    title: 'Guitar lessons',
    description: 'Beginners welcome. First lesson free, bring your own guitar.',
    image: null,
    price: 0,
    phoneNumber: '5550117',
    authorName: 'Clay Simons',
    mine: false,
    createdAt: Date.now() - 172800e3,
  },
];
