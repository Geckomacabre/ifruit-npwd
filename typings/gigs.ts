// Snarf (food delivery) and rydeme (rideshare). Both apps talk to the same
// Lua backend in lua/gigs, which says which one it is via the `app` field --
// 'goober' is rydeme's original identifier and is still what the Lua uses.

export type GigApp = 'snarf' | 'goober';

export interface GigOffer {
  id: number;
  pay: number;
  kindLabel: string;
  pickupLabel: string;
  dropoffLabel: string;
  distance: number;
  passengerName?: string;
  playerRide?: boolean;
}

export interface GigJob {
  pay: number;
  kindLabel: string;
  pickupLabel: string;
  dropoffLabel: string;
  passengerName?: string;
  playerRide?: boolean;
  stage?: string;
}

export interface GigHistoryEntry {
  name: string;
  stars: number;
  comment: string;
  pay: number;
  tip: number;
  ts: number;
  aborted?: boolean;
}

/** Rider-side ride, when you are the passenger rather than the driver. */
export interface GigRide {
  id: number | string;
  state: string;
  reason?: string;
  destLabel?: string;
  fare?: number;
  distance?: number;
  driverName?: string;
  driverRating?: number;
  vehicle?: string;
  tier?: string;
}

export interface GigState {
  app: GigApp;
  rating: number;
  hasJob: boolean;
  onDuty: boolean;
  /** rydeme has no board -- its work arrives as a request. */
  dispatchOnly: boolean;
  warnThreshold: number;
  offers: GigOffer[];
  job?: GigJob;
  incoming?: GigOffer;
  incomingSeconds?: number;
  riderMode?: boolean;
  driversOnline?: number;
  ride?: GigRide;
  /** Set when the client got no answer from the server. */
  serverFailed?: boolean;
  refillFailed?: boolean;
}

export interface GigProfile {
  rating: number;
  history: GigHistoryEntry[];
  warnThreshold: number;
  avatar?: string;
}

export interface GigActionResult {
  ok: boolean;
  message?: string;
}

export enum GigEvents {
  GET_STATE = 'npwd:gigs:getState',
  GET_LIVE = 'npwd:gigs:getLive',
  GET_PROFILE = 'npwd:gigs:getProfile',
  ACCEPT = 'npwd:gigs:accept',
  DECLINE = 'npwd:gigs:decline',
  SET_DUTY = 'npwd:gigs:setDuty',
  CANCEL = 'npwd:gigs:cancel',
  QUOTE_RIDE = 'npwd:gigs:quoteRide',
  REQUEST_RIDE = 'npwd:gigs:requestRide',
  CANCEL_RIDE = 'npwd:gigs:cancelRide',
  RATE_DRIVER = 'npwd:gigs:rateDriver',
  GET_MY_WAYPOINT = 'npwd:gigs:getMyWaypoint',
}
