import { LonelyCreator, LonelyPost, LonelyProfile } from '@typings/lonely';

export const money = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const PHOTO = 'https://i.imgur.com/2nCt3Sbl.jpg';

// Browser-preview stand-ins; fetchNui only returns these outside the game.
export const BrowserFeed: LonelyPost[] = [
  {
    id: 3, creator_citizenid: 'ABC123', caption: 'Behind the scenes from the shoot.',
    media_type: 'image', media_url: PHOTO, unlock_price: 0,
    creator_name: 'Marla Kane', creator_pic: PHOTO,
    is_unlocked: 1, like_count: 42, is_liked: 1, comment_count: 6,
  },
  {
    id: 2, creator_citizenid: 'DEF456', caption: 'Full set in the bio.',
    media_type: 'image', media_url: PHOTO, unlock_price: 250,
    creator_name: 'Jules', creator_pic: null,
    is_unlocked: 0, like_count: 118, is_liked: 0, comment_count: 21,
  },
];

export const BrowserCreators: LonelyCreator[] = [
  {
    citizenid: 'ABC123', display_name: 'Marla Kane', profile_pic: PHOTO,
    sub_price: 500, post_count: 24, sub_count: 61, is_subscribed: 1,
  },
  {
    citizenid: 'DEF456', display_name: 'Jules', profile_pic: null,
    sub_price: 300, post_count: 9, sub_count: 18, is_subscribed: 0,
  },
];

export const BrowserProfile: LonelyProfile = {
  citizenid: 'XYZ789',
  display_name: 'You',
  bio: 'Occasional poster.',
  sub_price: 250,
  earnings: 1840,
};
