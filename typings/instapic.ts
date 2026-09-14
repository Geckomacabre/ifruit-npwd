export interface InstaPicPost {
  id: number;
  image: string;
  caption: string;
  authorName: string;
  /** Posted by the viewer, so it can be deleted. */
  mine: boolean;
  likes: number;
  /** Whether the viewer has liked it. */
  liked: boolean;
  createdAt: number;
}

export interface InstaPicCreateDTO {
  image: string;
  caption?: string;
}

export interface InstaPicIdDTO {
  id: number;
}

export interface InstaPicLikeResult {
  id: number;
  likes: number;
  liked: boolean;
}

export type InstaPicError =
  | 'INVALID_IMAGE'
  | 'INVALID_CAPTION'
  | 'TOO_SOON'
  | 'NOT_FOUND'
  | 'GENERIC_DB_ERROR';

export const INSTAPIC_CAPTION_MAX = 300;
export const INSTAPIC_POST_COOLDOWN_MS = 30000;

export enum InstaPicEvents {
  FETCH = 'npwd:instapic:fetch',
  FETCH_MINE = 'npwd:instapic:fetchMine',
  CREATE = 'npwd:instapic:create',
  DELETE = 'npwd:instapic:delete',
  TOGGLE_LIKE = 'npwd:instapic:toggleLike',
}
