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

export interface GigCoords {
  x: number;
  y: number;
}

/**
 * The rider's view of an NPC ride: where the car is relative to them while it
 * approaches, and relative to the destination once they are aboard.
 */
export interface GigNpcRide {
  phase: string;
  destLabel?: string;
  speedBoost?: boolean;
  knoway?: boolean;
  driverPos?: GigCoords;
  pos?: GigCoords;
  destPos?: GigCoords;
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

  // ── Live fields, merged in from getLive once a second ──────────────────
  // rydeme only: the dash-mounted HUD while driving a fare. Snarf has no
  // speed mechanic, so its jobs never carry these.
  /** Where the current leg ends -- pickup or dropoff, whichever is next. */
  target?: GigCoords;
  /** The driver's own position. */
  pos?: GigCoords;
  speedMph?: number;
  /** Posted limit, sent only while the watched dropoff leg is being scored. */
  speedLimit?: number;
  overLimit?: boolean;
  npcRide?: GigNpcRide;
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
  GET_MY_COORDS = 'npwd:gigs:getMyCoords',
  RESOLVE_MAP_POINT = 'npwd:gigs:resolveMapPoint',
  GET_RIDER_CONFIG = 'npwd:gigs:getRiderConfig',
  NPC_SPEED_UP = 'npwd:gigs:npcSpeedUp',
  NPC_END_RIDE = 'npwd:gigs:npcEndRide',
  NPC_RATE_DRIVER = 'npwd:gigs:npcRateDriver',
}

/** Client-side config the rider UI needs; asked for once when the app opens. */
export interface GigRiderConfig {
  ok: boolean;
  npcEnabled?: boolean;
  npcBrand?: string;
}

/** A world position the in-app map can centre on or drop a pin at. */
export interface GigPoint {
  ok: boolean;
  message?: string;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
}
