export interface PagesPost {
  id: number;
  title: string;
  description: string;
  image: string | null;
  price: number | null;
  phoneNumber: string;
  authorName: string;
  /** Posted by the viewer (can delete). */
  mine: boolean;
  createdAt: number;
}

export interface PagesCreateDTO {
  title: string;
  description: string;
  image?: string;
  price?: number | null;
}

export interface PagesIdDTO {
  id: number;
}

export type PagesError = 'INVALID_TITLE' | 'INVALID_DESCRIPTION' | 'INVALID_IMAGE' | 'INVALID_PRICE' | 'TOO_SOON';

export const PAGES_TITLE_MAX = 50;
export const PAGES_DESCRIPTION_MAX = 1000;
export const PAGES_PRICE_MAX = 100000000;
export const PAGES_POST_COOLDOWN_MS = 60000;

export enum PagesEvents {
  FETCH = 'npwd:pages:fetch',
  CREATE = 'npwd:pages:create',
  DELETE = 'npwd:pages:delete',
}
