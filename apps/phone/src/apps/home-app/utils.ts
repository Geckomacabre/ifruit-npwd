import { HomeProperty } from '@typings/home';

export const money = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const rentLabel = (hours: number): string =>
  hours % 24 === 0 ? `Rent every ${hours / 24}d` : `Rent every ${hours}h`;

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserProperties: HomeProperty[] = [
  {
    id: 1,
    name: 'Mirror Park Bungalow',
    price: 285000,
    rentInterval: null,
    owned: true,
    x: 1275.4,
    y: -1710.2,
    z: 54.7,
    keyholders: [
      { citizenid: 'ABC12345', name: 'Marla Kane' },
      { citizenid: 'DEF67890', name: 'Dwayne Ellis' },
    ],
  },
  {
    id: 2,
    name: 'Integrity Way, Apt 28',
    price: 1200,
    rentInterval: 168,
    owned: false,
    x: -47.1,
    y: -585.6,
    z: 88.7,
    keyholders: [],
  },
];
