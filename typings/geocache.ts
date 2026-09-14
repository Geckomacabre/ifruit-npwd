export interface GeoCache {
  id: string;
  type: 'world' | 'player';
  name: string;
  clue: string;
  difficulty: number;
  gta_x: number;
  gta_y: number;
  avg_rating: number;
  rating_count: number;
  submitter: string;
}

export interface GeoCacheComment {
  player_name: string;
  text: string;
  posted_at: string;
}

export interface GeoCacheDetail {
  avg_rating: number;
  rating_count: number;
  comments: GeoCacheComment[];
}

export interface GeoCacheRecent {
  id: string;
  label: string;
}

export interface GeoCacheStats {
  found: number;
  submitted: number;
  recent: GeoCacheRecent[];
}

export interface GeoCacheResult {
  ok: boolean;
  message?: string;
}

export interface GeoCacheSubmitDTO {
  name: string;
  clue: string;
  difficulty: number;
}

export enum GeoCacheEvents {
  GET_CACHES = 'npwd:geocache:getCaches',
  GET_DETAIL = 'npwd:geocache:getCacheDetail',
  GET_STATS = 'npwd:geocache:getMyStats',
  RATE = 'npwd:geocache:rateCache',
  COMMENT = 'npwd:geocache:addComment',
  START_PLACEMENT = 'npwd:geocache:startPlacement',
}
