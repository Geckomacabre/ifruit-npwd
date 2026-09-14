export interface CrimeAccount {
  username: string;
  avatar: string | null;
  points: number;
  level: { name: string; min?: number } | string;
  badge: string | null;
  subscribed: boolean;
}

export interface CrimeCategory {
  id: string;
  label: string;
  severity?: string;
}

export interface CrimeComment {
  id?: number;
  username: string;
  badge?: string | null;
  text: string;
  createdAt?: number;
}

export interface CrimeReport {
  id: number;
  category: string;
  categoryLabel: string;
  severity: string;
  title: string;
  details: string;
  coords: { x: number; y: number; z: number };
  streetLabel: string;
  zoneLabel: string;
  author: { username: string; avatar: string | null; badge: string | null };
  media: string[] | null;
  confirmCount: number;
  comments: CrimeComment[];
  createdAt: number;
}

export interface CrimeCatalog {
  categories: CrimeCategory[];
  severities?: Record<string, unknown>;
  appName?: string;
  sosEnabled?: boolean;
}

export interface CrimeAppData {
  account: CrimeAccount | null;
  catalog: CrimeCatalog;
  reports: CrimeReport[];
  /** Map of report id -> true for reports the viewer already confirmed. */
  confirmed: Record<string, boolean>;
  canModerate: boolean;
}

/** Every action callback answers in this shape. */
export interface CrimeResult {
  ok: boolean;
  err?: string;
  extra?: unknown;
}

export enum CrimeEvents {
  GET_APP_DATA = 'npwd:crime:getAppData',
  GET_POSITION = 'npwd:crime:getPosition',
  SIGNUP = 'npwd:crime:signup',
  LOGIN = 'npwd:crime:login',
  LOGOUT = 'npwd:crime:logout',
  CHANGE_PASSWORD = 'npwd:crime:changePassword',
  POST_REPORT = 'npwd:crime:postReport',
  CONFIRM = 'npwd:crime:confirmReport',
  COMMENT = 'npwd:crime:commentReport',
  DELETE_REPORT = 'npwd:crime:deleteReport',
  SOS = 'npwd:crime:sos',
  SET_WAYPOINT = 'npwd:crime:setWaypoint',
  SET_SUBSCRIBED = 'npwd:crime:setSubscribed',
}
