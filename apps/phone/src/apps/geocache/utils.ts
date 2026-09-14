import { GeoCache, GeoCacheDetail, GeoCacheStats } from '@typings/geocache';

// Browser-preview stand-ins; fetchNui only returns these outside the game.
export const BrowserCaches: GeoCache[] = [
  {
    id: 'pier_01', type: 'world', name: 'Under the Boardwalk',
    clue: 'Where the Ferris wheel throws its longest shadow, look low.',
    difficulty: 2, gta_x: -1670, gta_y: -1120, avg_rating: 4.3, rating_count: 12,
    submitter: 'LS Parks Dept.',
  },
  {
    id: '7', type: 'player', name: 'Chiliad Cold Storage',
    clue: 'The last switchback before the summit. Behind the sign nobody reads.',
    difficulty: 5, gta_x: 450, gta_y: 5570, avg_rating: 4.9, rating_count: 5,
    submitter: 'Marla Kane',
  },
];

export const BrowserDetail: GeoCacheDetail = {
  avg_rating: 4.3,
  rating_count: 12,
  comments: [
    { player_name: 'Dwayne Ellis', text: 'Took me three passes. Worth it.', posted_at: '' },
    { player_name: 'Marla Kane', text: 'Muddy after rain, bring boots.', posted_at: '' },
  ],
};

export const BrowserStats: GeoCacheStats = {
  found: 14,
  submitted: 2,
  recent: [
    { id: 'pier_01', label: 'Under the Boardwalk' },
    { id: 'vinewood_03', label: 'Sign of the Times' },
  ],
};
