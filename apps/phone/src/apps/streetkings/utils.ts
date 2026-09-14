import {
  StreetKingsBoot,
  StreetKingsInvite,
  StreetKingsLeaderboardRow,
  StreetKingsProfile,
} from '@typings/streetkings';

/** Lap time, m:ss.mmm — the same shape the race HUD uses. */
export const lapTime = (ms?: number): string => {
  if (!ms || ms <= 0) return '—';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
};

export const countdown = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
};

export const money = (amount = 0): string => `$${Math.round(amount).toLocaleString()}`;

export const round = (value = 0, places = 0): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: places });

/**
 * Vehicle models come out of the database as spawn names (`banshee2`), which
 * is what the leaderboard has to show — there is no display-name table on this
 * side. Upper-casing at least makes them read as identifiers rather than typos.
 */
export const modelName = (model?: string): string => (model ? model.toUpperCase() : '');

// ── Browser-preview fixtures ────────────────────────────────────────────────
// Only reached by fetchNuiResource when running outside the game.

export const BrowserBoot: StreetKingsBoot = {
  ok: true,
  charName: 'Marcus Reyes',
  routes: [
    { id: 'vinewood_hills', name: 'Vinewood Hills Sprint', scheme: 'ordered', laps: 1, goalTime: 184000, distance: 3.2, gated: false },
    { id: 'docks_circuit', name: 'Terminal Docks Circuit', scheme: 'ordered', laps: 3, goalTime: 265000, distance: 5.8, gated: false },
    { id: 'chiliad_descent', name: 'Chiliad Descent', scheme: 'ordered', laps: 1, distance: 7.4, gated: true },
  ],
  classes: [
    { id: 7, label: 'Super' },
    { id: 6, label: 'Sports' },
    { id: 5, label: 'Sports Classics' },
    { id: 4, label: 'Muscle' },
    { id: 2, label: 'SUVs' },
    { id: 8, label: 'Motorcycles' },
  ],
};

export const BrowserProfile: StreetKingsProfile = {
  level: 12,
  xp: 15400,
  levelStartXp: 14400,
  nextLevelXp: 16900,
  stats: {
    racesCompleted: 84,
    racesWon: 31,
    racesLost: 53,
    npcChallengesWon: 12,
    npcChallengesLost: 4,
    bestWinStreak: 7,
    currentWinStreak: 2,
    goalTimesBeaten: 19,
    topSpeedMph: 187.4,
    totalMilesDriven: 612.9,
    totalCashEarned: 248300,
    bestDriftScore: 41200,
    policeEscapes: 9,
  },
};

export const BrowserLeaderboard: StreetKingsLeaderboardRow[] = [
  { citizenid: 'ABC12345', alias: 'Nitro', score_ms: 178432, vehicle_model: 'banshee2' },
  { citizenid: 'DEF67890', alias: 'Marcus Reyes', score_ms: 181005, vehicle_model: 'sultanrs' },
  { citizenid: 'GHI13579', alias: 'Kaz', score_ms: 184760, vehicle_model: 'elegy2' },
];

export const BrowserInvite: StreetKingsInvite = {
  rival: 'Diego Vance',
  message: 'Heard you were quick. Meet me on Route 68 and prove it.',
  expiresInMs: 168000,
};
