import { GigApp, GigProfile, GigState } from '@typings/gigs';

// Browser-preview stand-ins; fetchNui only returns these outside the game.

export const mockState = (app: GigApp): GigState => ({
  app,
  rating: 4.6,
  hasJob: false,
  // rydeme opens off duty, so the preview shows the passenger half -- a driver
  // and a passenger are mutually exclusive and rydeme is mostly the latter.
  onDuty: app === 'snarf',
  dispatchOnly: app === 'goober',
  warnThreshold: 4,
  riderMode: app === 'goober',
  driversOnline: 3,
  offers:
    app === 'snarf'
      ? [
          {
            id: 1,
            pay: 240,
            kindLabel: 'Across town',
            pickupLabel: 'Taco Farmer',
            dropoffLabel: 'Mirror Park',
            distance: 2.4,
          },
          {
            id: 2,
            pay: 120,
            kindLabel: 'Quick hop',
            pickupLabel: 'Chihuahua Hotdogs',
            dropoffLabel: 'Legion Square',
            distance: 0.9,
          },
          {
            id: 3,
            pay: 460,
            kindLabel: 'Long haul',
            pickupLabel: 'Burger Shot',
            dropoffLabel: 'Sandy Shores',
            distance: 8.1,
          },
        ]
      : [],
});

export const mockProfile: GigProfile = {
  rating: 4.6,
  warnThreshold: 4,
  history: [
    { name: 'Marla K.', stars: 5, comment: 'Fast and the food was still hot.', pay: 240, tip: 40, ts: 1757800000 },
    { name: 'Dwayne', stars: 4, comment: 'Took the long way but fine.', pay: 180, tip: 0, ts: 1757790000 },
    { name: 'Rider', stars: 1, comment: 'Never showed up.', pay: 0, tip: 0, ts: 1757780000, aborted: true },
  ],
};
