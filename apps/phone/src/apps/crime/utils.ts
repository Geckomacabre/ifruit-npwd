import { CrimeAppData } from '@typings/crime';

export const timeAgo = (ts: number): string => {
  // The server stores seconds; be tolerant of either unit.
  const ms = ts > 1e12 ? ts : ts * 1000;
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserCrimeData: CrimeAppData = {
  account: {
    username: 'nightowl',
    avatar: null,
    points: 240,
    level: 'Trusted Citizen',
    badge: null,
    subscribed: true,
  },
  canModerate: false,
  confirmed: { 2: true },
  catalog: {
    sosEnabled: true,
    categories: [
      { id: 'robbery', label: 'Robbery' },
      { id: 'shots', label: 'Shots fired' },
      { id: 'crash', label: 'Crash' },
      { id: 'suspicious', label: 'Suspicious' },
    ],
  },
  reports: [
    {
      id: 3,
      category: 'shots',
      categoryLabel: 'Shots fired',
      severity: 'high',
      title: 'Shots near the pier',
      details: 'Two cars pulled up and started shooting, then drove north.',
      coords: { x: -1670, y: -1120, z: 13 },
      streetLabel: 'Del Perro Fwy',
      zoneLabel: 'Vespucci Beach',
      author: { username: 'marla_k', avatar: null, badge: null },
      media: null,
      confirmCount: 4,
      comments: [{ username: 'dwayne', text: 'Heard it from Mirror Park.', badge: null }],
      createdAt: Date.now() - 1000 * 60 * 12,
    },
    {
      id: 2,
      category: 'crash',
      categoryLabel: 'Crash',
      severity: 'medium',
      title: '',
      details: 'Truck rolled on the off-ramp, blocking two lanes.',
      coords: { x: 120, y: -1200, z: 29 },
      streetLabel: 'Elgin Ave',
      zoneLabel: 'Strawberry',
      author: { username: 'lsfd_watch', avatar: null, badge: 'EMS' },
      media: null,
      confirmCount: 9,
      comments: [],
      createdAt: Date.now() - 1000 * 60 * 90,
    },
  ],
};
