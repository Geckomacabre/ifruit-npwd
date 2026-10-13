import {
  ForeclosureCatalog,
  ForeclosureChoices,
  ForeclosureListing,
  ForeclosureMarket,
  ForeclosureQuote,
  ForeclosureQuoteResponse,
} from '@typings/foreclosures';

export const money = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const rentLabel = (hours: number): string =>
  hours % 24 === 0 ? `every ${hours / 24} day${hours / 24 === 1 ? '' : 's'}` : `every ${hours} hours`;

export type Filter = 'all' | 'nightclub' | 'house' | 'apartment';

export const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'nightclub', label: 'Nightclubs' },
  { id: 'house', label: 'Houses' },
  { id: 'apartment', label: 'Apartments' },
];

/** The choice groups of a nightclub, in the order the game's site shows them. */
export const CHOICE_GROUPS: { id: 'style' | 'sign' | 'lights' | 'dancers'; label: string; hint: string }[] = [
  { id: 'style', label: 'Style', hint: 'The decor of the whole club' },
  { id: 'sign', label: 'Name', hint: 'What the sign over the door says' },
  { id: 'lights', label: 'Lighting', hint: 'The rig over the dance floor. The colour is the DJ’s' },
  { id: 'dancers', label: 'Dancers', hint: 'On the podium' },
];

// -----------------------------------------------------------------------------
// Browser-preview stand-ins. fetchNui only returns these outside the game; the quote is computed from the
// choices so the preview behaves like the real thing.
// -----------------------------------------------------------------------------

export const BrowserMarket: ForeclosureMarket = {
  balance: 4820000,
  account: 'bank',
  ownedNightclub: null,
  listings: [
    { key: 'nightclub:Vinewood', kind: 'nightclub', id: 'Vinewood', name: 'Downtown Vinewood', category: 'nightclub', price: 1210000, status: 'available', zone: 'Downtown Vinewood', x: 340, y: 195, customizable: true, incomeMin: 1500, incomeMax: 50000, payoutMinutes: 48, safeCap: 250000 },
    { key: 'nightclub:MissionRow', kind: 'nightclub', id: 'MissionRow', name: 'Mission Row', category: 'nightclub', price: 1350000, status: 'available', zone: 'Mission Row', x: 440, y: -990, customizable: true, incomeMin: 1500, incomeMax: 50000, payoutMinutes: 48, safeCap: 250000 },
    { key: 'nightclub:LSIA', kind: 'nightclub', id: 'LSIA', name: 'LSIA', category: 'nightclub', price: 1080000, status: 'sold', ownerName: 'Marla Kane', zone: 'Los Santos Intl', x: -1140, y: -2290, customizable: true },
    { key: 'nightclub:ElysianIsland', kind: 'nightclub', id: 'ElysianIsland', name: 'Elysian Island', category: 'nightclub', price: 1000000, status: 'available', zone: 'Elysian Island', x: 250, y: -3050, customizable: true, incomeMin: 1500, incomeMax: 50000, payoutMinutes: 48, safeCap: 250000 },
    { key: 'property:1', kind: 'property', id: 1, name: 'Del Perro Heights Apt 4', category: 'apartment', price: 450000, status: 'available', mode: 'buy', zone: 'Del Perro', x: -1447, y: -538 },
    { key: 'property:2', kind: 'property', id: 2, name: 'Vinewood House 12', category: 'house', price: 800000, status: 'available', mode: 'buy', zone: 'Vinewood Hills', x: 100, y: 200 },
    { key: 'property:3', kind: 'property', id: 3, name: 'Strawberry Flat 3', category: 'apartment', price: 2500, status: 'available', mode: 'rent', rentInterval: 168, zone: 'Strawberry', x: 300, y: -400 },
  ],
};

export const BrowserCatalog: ForeclosureCatalog = {
  style: [
    { value: 'trad', label: 'Traditional', price: 0 },
    { value: 'edgy', label: 'Edgy', price: 225000 },
    { value: 'glam', label: 'Glamorous', price: 300000 },
  ],
  sign: [
    { value: 'galaxy', label: 'Galaxy', price: 0 },
    { value: 'studio', label: 'Studio Los Santos', price: 33500 },
    { value: 'omega', label: 'Omega', price: 33500 },
    { value: 'technologie', label: 'Technologie', price: 33500 },
    { value: 'paradise', label: 'Paradise', price: 33500 },
  ],
  lights: [
    { value: 'droplets_yellow', label: 'Droplets', price: 35000 },
    { value: 'neons_yellow', label: 'Neons', price: 0 },
    { value: 'bands_yellow', label: 'Bands', price: 140000 },
    { value: 'lasers_yellow', label: 'Lasers', price: 217500 },
  ],
  dancers: [
    { value: 0, label: 'No dancers', price: 0 },
    { value: 1, label: 'Style 1: female dancers', price: 213500 },
    { value: 2, label: 'Style 1: male dancers', price: 213500 },
    { value: 3, label: 'Style 1: female and male dancers', price: 233500 },
  ],
  dryIce: { price: 345000 },
};

/** A quote worked out locally, for the browser preview only. */
export const mockQuote = (
  listing: ForeclosureListing,
  catalog: ForeclosureCatalog | null,
  choices: ForeclosureChoices,
): ForeclosureQuoteResponse => {
  const lines: ForeclosureQuote['lines'] = [];

  const add = (options: { value: string | number; label: string; price: number }[] | undefined, value: string | number | undefined) => {
    const hit = options?.find((o) => o.value === value);
    if (hit && hit.price > 0) lines.push({ label: hit.label, price: hit.price });
  };

  if (catalog) {
    add(catalog.style, choices.style);
    add(catalog.sign, choices.sign);
    add(catalog.lights, choices.lights);
    add(catalog.dancers, choices.dancers);
    if (choices.dryIce && catalog.dryIce) lines.push({ label: 'Dry ice machine', price: catalog.dryIce.price });
  }

  const extras = lines.reduce((sum, l) => sum + l.price, 0);
  return {
    quote: { total: listing.price + extras, base: listing.price, extras, lines, mode: listing.mode, rentInterval: listing.rentInterval },
  };
};
