// Hustle: every way to make money on the server, read from um_guide's
// directory (resources/[UM]/um_guide/config.lua) through lua/hustle.

export interface HustleCategory {
  id: string;
  label: string;
  /** A money tab (jobs, crime, ...) rather than shops and services. */
  money: boolean;
  order: number;
}

export interface HustleStep {
  text: string;
  /** This step has a place, so a waypoint can be set for it. */
  waypoint: boolean;
}

export interface HustleActivity {
  id: string;
  cat: string;
  label: string;
  what: string;
  need: string;
  pays: string;
  start?: string;
  steps?: HustleStep[];
  /** The player has been near it at least once. */
  seen: boolean;
  /** A waypoint can be set (it happens somewhere specific). */
  waypoint: boolean;
  /** Done anywhere: no place to go. */
  anywhere: boolean;
  /** Happens in many places; the waypoint goes to the nearest. */
  many: boolean;
  /** Metres to the nearest place it happens. */
  distance?: number;
}

export interface HustleDirectory {
  categories: HustleCategory[];
  activities: HustleActivity[];
  found: number;
  total: number;
  /** Set when um_guide is not running. */
  error?: string;
}

export interface HustleWaypointDTO {
  id: string;
  step?: number;
}

export enum HustleEvents {
  FETCH = 'npwd:hustle:fetch',
  WAYPOINT = 'npwd:hustle:waypoint',
}
