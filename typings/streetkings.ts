/**
 * Street Kings — racing career, leaderboards and NPC challenges.
 *
 * Unlike every other ported app, the Lua side of this one does not live in
 * npwd/lua: its callbacks read SKRaceEvents, SKRouteBuilder and SKNpcInvite,
 * globals owned by the sk_streetkings resource. The UI therefore talks to that
 * resource directly with fetchNuiResource, so these are plain callback names
 * rather than the usual npwd-namespaced events.
 */
export const STREETKINGS_RESOURCE = 'sk_streetkings';

export enum StreetKingsEvents {
  BOOT = 'streetkings:boot',
  GET_PROFILE = 'streetkings:getProfile',
  GET_LEADERBOARD = 'streetkings:getLeaderboard',
  GET_INVITE = 'streetkings:getInvite',
  ACCEPT_INVITE = 'streetkings:acceptInvite',
  DECLINE_INVITE = 'streetkings:declineInvite',
}

export interface StreetKingsRoute {
  id: string;
  name: string;
  /** 'ordered' runs the checkpoints in sequence; other schemes are free-form. */
  scheme: string;
  laps: number;
  /** Par time in ms, if the route sets one. */
  goalTime?: number;
  /** Miles — the bridge converts from metres. */
  distance: number;
  /** True when the route is locked behind an unlock requirement. */
  gated: boolean;
}

export interface StreetKingsClass {
  id: number;
  label: string;
}

export interface StreetKingsBoot {
  ok: boolean;
  charName: string;
  routes: StreetKingsRoute[];
  classes: StreetKingsClass[];
}

/**
 * Career counters. Every key is optional because the server hands back
 * whatever the save document holds — an untouched character has an empty
 * table, and older saves predate the newer counters.
 */
export interface StreetKingsStats {
  totalMilesDriven?: number;
  topSpeedMph?: number;
  totalCashEarned?: number;
  totalCashSpent?: number;
  racesCompleted?: number;
  racesWon?: number;
  racesLost?: number;
  npcChallengesWon?: number;
  npcChallengesLost?: number;
  rampagesCompleted?: number;
  bestRampageScore?: number;
  stuntJumpsCompleted?: number;
  speedCameraFlashes?: number;
  policeBusts?: number;
  policeEscapes?: number;
  totalRepairs?: number;
  clothingPurchased?: number;
  driftPointsTotal?: number;
  bestDriftScore?: number;
  currentWinStreak?: number;
  bestWinStreak?: number;
  goalTimesBeaten?: number;
  betsWon?: number;
}

export interface StreetKingsProfile {
  stats: StreetKingsStats;
  level: number;
  xp: number;
  /** XP at which the current level began, and at which the next one starts. */
  levelStartXp: number;
  nextLevelXp: number;
}

/** One row of a route + class leaderboard, best time first. */
export interface StreetKingsLeaderboardRow {
  citizenid: string;
  alias: string;
  score_ms: number;
  vehicle_model: string;
}

export type StreetKingsPeriod = 'day' | 'week' | 'month' | 'all';

export interface StreetKingsInvite {
  rival: string;
  message: string;
  expiresInMs: number;
}

export interface StreetKingsResult {
  ok: boolean;
}
