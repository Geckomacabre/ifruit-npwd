export interface TrendyPost {
  id: number;
  /** Image or video URL, both served from the configured image hosts. */
  media: string;
  /** Videos autoplay and loop; images hold on screen. */
  isVideo: boolean;
  caption: string;
  authorName: string;
  mine: boolean;
  likes: number;
  liked: boolean;
  createdAt: number;
}

export interface TrendyCreateDTO {
  media: string;
  caption?: string;
}

export interface TrendyIdDTO {
  id: number;
}

export interface TrendyLikeResult {
  id: number;
  likes: number;
  liked: boolean;
}

export type TrendyError = 'INVALID_MEDIA' | 'TOO_SOON' | 'NOT_FOUND' | 'GENERIC_DB_ERROR';

export const TRENDY_CAPTION_MAX = 200;
export const TRENDY_POST_COOLDOWN_MS = 30000;

export enum TrendyEvents {
  FETCH = 'npwd:trendy:fetch',
  CREATE = 'npwd:trendy:create',
  DELETE = 'npwd:trendy:delete',
  TOGGLE_LIKE = 'npwd:trendy:toggleLike',
}
