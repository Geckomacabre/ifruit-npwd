import { GARAGE_VALET_PRICE, GarageVehicle } from '@typings/garage';

const ACTION_ERRORS: Record<string, string> = {
  no_money: `Valet costs $${GARAGE_VALET_PRICE} and your bank is short.`,
  no_spot: 'The valet could not find a road near you.',
  already_out: 'That car is already out somewhere.',
  not_garaged: 'Park it in a garage first, then call the valet.',
  in_vehicle: 'Get out of your current vehicle first.',
  busy: 'A driver is already bringing you a car.',
  not_found: "That car isn't out right now.",
  occupied: 'Someone is sitting in that car.',
  too_far: 'Too far away to summon. Go get it or use the valet.',
};

export const actionErrorText = (code?: string): string =>
  ACTION_ERRORS[code ?? ''] ?? 'Something went wrong. Try again.';

export const locationText = (vehicle: GarageVehicle): string => {
  if (vehicle.state === 'out') return vehicle.spawned ? 'Out on the streets' : 'Out (not nearby)';
  if (vehicle.state === 'impounded') {
    return `Impounded${vehicle.garage ? ` at ${vehicle.garage}` : ''}${
      vehicle.depotPrice ? ` · $${vehicle.depotPrice.toLocaleString('en-US')} to release` : ''
    }`;
  }
  return vehicle.garage ? `Parked at ${vehicle.garage}` : 'Parked';
};

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserVehicles: GarageVehicle[] = [
  {
    id: 1,
    plate: '4GTR802',
    name: 'Karin Sultan RS',
    category: 'sports',
    state: 'garaged',
    spawned: false,
    locked: null,
    garage: 'Legion Square',
    depotPrice: 0,
    fuel: 82,
    engine: 100,
    body: 96,
  },
  {
    id: 2,
    plate: 'KLEB1TZ',
    name: 'Western Daemon',
    category: 'motorcycles',
    state: 'out',
    spawned: true,
    locked: true,
    garage: null,
    depotPrice: 0,
    fuel: 35,
    engine: 71,
    body: 58,
  },
  {
    id: 3,
    plate: '88LOST88',
    name: 'Bravado Gauntlet',
    category: 'muscle',
    state: 'impounded',
    spawned: false,
    locked: null,
    garage: 'Hayes Depot',
    depotPrice: 850,
    fuel: 10,
    engine: 42,
    body: 30,
  },
];
