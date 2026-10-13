import { HustleActivity, HustleCategory, HustleDirectory } from '@typings/hustle';

/** Tab id for every non-money category (shops, services, crafting) together. */
export const PLACES_TAB = 'places';

export interface HustleTab {
  id: string;
  label: string;
}

/** One tab per money category, in order, then one Places tab for the rest. */
export const buildTabs = (categories: HustleCategory[]): HustleTab[] => {
  const tabs: HustleTab[] = categories.filter((c) => c.money).map((c) => ({ id: c.id, label: c.label }));
  if (categories.some((c) => !c.money)) tabs.push({ id: PLACES_TAB, label: 'Places' });
  return tabs;
};

export const inTab = (activity: HustleActivity, tab: string, categories: HustleCategory[]): boolean => {
  if (tab !== PLACES_TAB) return activity.cat === tab;
  const cat = categories.find((c) => c.id === activity.cat);
  return !!cat && !cat.money;
};

export const matches = (activity: HustleActivity, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [activity.label, activity.what, activity.need, activity.pays, activity.start ?? '']
    .join(' ')
    .toLowerCase()
    .includes(q);
};

export const distanceLabel = (activity: HustleActivity): string | null => {
  if (activity.anywhere) return 'Anywhere';
  if (activity.distance === undefined || activity.distance === null) return null;
  const km = activity.distance / 1000;
  const text = activity.distance < 1000 ? `${activity.distance} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
  return activity.many ? `Nearest ${text}` : text;
};

// Browser-preview stand-in; fetchNui only returns it outside the game.
export const BrowserDirectory: HustleDirectory = {
  found: 3,
  total: 9,
  categories: [
    { id: 'start', label: 'Start here', money: true, order: 1 },
    { id: 'legal', label: 'Jobs', money: true, order: 2 },
    { id: 'gather', label: 'Gathering', money: true, order: 3 },
    { id: 'criminal', label: 'Crime', money: true, order: 4 },
    { id: 'sport', label: 'Bets & fun', money: true, order: 5 },
    { id: 'shop', label: 'Shops', money: false, order: 8 },
  ],
  activities: [
    {
      id: 'cityhall', cat: 'start', label: 'City Hall Job Centre',
      what: 'Sign up for any legal job. It is free, you can switch whenever you like, and picking one sets a waypoint to where it starts.',
      need: 'Nothing to take a job. Fees for ID and licences.',
      pays: 'Each job says what it pays when you pick it. Gathering, hunting, fishing and most crime need no job at all.',
      start: 'Walk in and use the Job Centre desk.',
      seen: true, waypoint: true, anywhere: false, many: false, distance: 640,
    },
    {
      id: 'begging', cat: 'start', label: 'Begging & Busking',
      what: 'Stand at a junction with a cardboard sign and ask stopped drivers and passers-by for change.',
      need: 'A cardboard sign (Sister Agnes hands you the makings) and no home of your own.',
      pays: '$1-15 a time, sometimes $25-75. Slow, but it is money from nothing.',
      start: 'Use the cardboard sign from your inventory at a busy junction.',
      seen: false, waypoint: false, anywhere: true, many: false,
    },
    {
      id: 'docks', cat: 'legal', label: 'Docks',
      what: 'Work the container crane at the port. About one in four containers is "hot": a smuggler pays extra.',
      need: 'The Port Dockhand job (City Hall).',
      pays: '$120-180 a container. A hot one pays $250-400 more plus 1-3 bricks of weed.',
      seen: false, waypoint: true, anywhere: false, many: false, distance: 3120,
    },
    {
      id: 'oilfield', cat: 'gather', label: 'Crude Oil Buyer',
      what: 'Work the pumpjacks in the oil fields, then bring the crude here.',
      need: 'Nothing.',
      pays: '$35 a unit, 2-4 units a pumpjack.',
      start: 'Walk up to any oil pumpjack and interact with it.',
      seen: false, waypoint: true, anywhere: false, many: false, distance: 2410,
    },
    {
      id: 'drugseeds', cat: 'criminal', label: 'Seed Supplier',
      what: 'Drugs start here: a man in Hawick sells weed and coca seeds, pots, fertiliser and baggies. Weed is the easiest way in.',
      need: 'About $1,200 for a first weed grow, including the bagging table.',
      pays: 'Bagged weed sells on the street for $35-90 (low quality) up to $170-330 (exotic).',
      start: 'Buy a weed seed, a plant pot and some baggies from him.',
      steps: [
        { text: 'Buy a weed seed ($100-130), a plant pot ($10), a water bottle, fertiliser and baggies ($1 each) here.', waypoint: true },
        { text: 'Buy a bagging table ($1,000) from the equipment dealer at the docks.', waypoint: true },
        { text: 'Plant somewhere out of sight: use the seed with the pot in your pockets.', waypoint: false },
        { text: 'Wait about 3 real hours. It keeps growing while you are offline.', waypoint: false },
        { text: 'Place the bagging table and bag the buds: one bud plus one baggy makes one bag.', waypoint: false },
        { text: 'Sell: walk up to people on the street and offer them a bag.', waypoint: false },
      ],
      seen: true, waypoint: true, anywhere: false, many: false, distance: 1880,
    },
    {
      id: 'storerobbery', cat: 'criminal', label: 'Store Robbery',
      what: 'Hold up any 24/7, LTD or liquor store: aim a gun at the clerk.',
      need: 'A gun. For the safe: a drill.',
      pays: '$250-800 from the till, $900-1,800 from the safe.',
      start: 'Walk into any store and aim at the clerk.',
      seen: true, waypoint: true, anywhere: false, many: true, distance: 410,
    },
    {
      id: 'mugging', cat: 'criminal', label: 'Mugging',
      what: 'Point a gun at someone on the street, up close, and take what they have.',
      need: 'A gun.',
      pays: 'About $200 on average.',
      seen: false, waypoint: false, anywhere: true, many: false,
    },
    {
      id: 'casino', cat: 'sport', label: 'Diamond Casino',
      what: 'Slots, blackjack, roulette, poker, horse racing and the lucky wheel.',
      need: 'Money to buy chips.',
      pays: 'Whatever the house lets you keep.',
      seen: false, waypoint: true, anywhere: false, many: false, distance: 5230,
    },
    {
      id: 'general', cat: 'shop', label: '24/7 Store',
      what: 'Basics: food, water, a phone, bandages, a lighter, scratch cards.',
      need: 'Money.',
      pays: 'Nothing.',
      seen: false, waypoint: true, anywhere: false, many: false, distance: 900,
    },
  ],
};
