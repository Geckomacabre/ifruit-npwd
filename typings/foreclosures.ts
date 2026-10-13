export type ListingStatus = 'available' | 'sold' | 'yours';

/** One thing for sale, whichever resource owns it (a nightclub, a house, an apartment, ...). `key` is `kind:id` and is what the server is asked about. */
export interface ForeclosureListing {
  key: string;
  kind: string;
  id: string | number;
  name: string;
  category: 'nightclub' | 'house' | 'apartment' | string;
  price: number;
  status: ListingStatus;
  ownerName?: string;
  x?: number | null;
  y?: number | null;
  z?: number | null;
  /** The game's name for the area, resolved on the client. */
  zone?: string | null;

  // nightclubs
  customizable?: boolean;
  incomeMin?: number;
  incomeMax?: number;
  payoutMinutes?: number;
  safeCap?: number;

  // homes and apartments
  mode?: 'buy' | 'rent';
  /** Hours between rent charges. */
  rentInterval?: number | null;
}

export interface ForeclosureMarket {
  listings: ForeclosureListing[];
  balance: number;
  account: string;
  /** The nightclub this player already owns (a player owns one), if any. */
  ownedNightclub?: string | null;
}

export interface CatalogOption {
  value: string | number;
  label: string;
  price: number;
}

/** What a buyer may choose for a nightclub before paying, each with its price against a new club. */
export interface ForeclosureCatalog {
  style?: CatalogOption[];
  sign?: CatalogOption[];
  lights?: CatalogOption[];
  dancers?: CatalogOption[];
  dryIce?: { price: number };
}

export interface ForeclosureChoices {
  style?: string;
  sign?: string;
  lights?: string;
  dancers?: number;
  dryIce?: boolean;
}

export interface ForeclosureQuote {
  total: number;
  base: number;
  extras: number;
  lines: { label: string; price: number }[];
  mode?: 'buy' | 'rent';
  rentInterval?: number | null;
}

export interface ForeclosureQuoteResponse {
  quote?: ForeclosureQuote;
  error?: string;
}

export interface ForeclosureBuyResponse {
  ok: boolean;
  message: string;
  balance?: number;
  receipt?: { clubId: string; label: string; paid: number };
}

export enum ForeclosureEvents {
  MARKET = 'npwd:foreclosures:market',
  CATALOG = 'npwd:foreclosures:catalog',
  QUOTE = 'npwd:foreclosures:quote',
  BUY = 'npwd:foreclosures:buy',
  LOCATE = 'npwd:foreclosures:locate',
}
