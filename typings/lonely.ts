export interface LonelyPost {
  id: number;
  creator_citizenid: string;
  caption: string;
  media_type: string;
  media_url: string | null;
  unlock_price: number;
  creator_name: string;
  creator_pic: string | null;
  /** 1 when the viewer owns, subscribes to, or has unlocked this post. */
  is_unlocked: number;
  like_count: number;
  is_liked: number;
  comment_count: number;
}

export interface LonelyCreator {
  citizenid: string;
  display_name: string;
  profile_pic: string | null;
  bio?: string;
  sub_price: number;
  post_count: number;
  sub_count: number;
  is_subscribed: number;
}

export interface LonelyProfile {
  citizenid?: string;
  display_name?: string;
  profile_pic?: string | null;
  bio?: string;
  sub_price?: number;
  earnings?: number;
}

export interface LonelyComment {
  id: number;
  citizenid: string;
  display_name: string;
  text: string;
}

export interface LonelyConfig {
  minSubPrice: number;
  maxSubPrice: number;
  maxPostPrice: number;
  creatorCut: number;
}

export interface LonelyAccountCheck {
  hasAccount: boolean;
  username?: string;
}

/** Most action callbacks answer with success plus an optional message. */
export interface LonelyResult {
  success?: boolean;
  ok?: boolean;
  message?: string;
}

export enum LonelyEvents {
  GET_PLAYER = 'npwd:lonely:getPlayerData',
  GET_CONFIG = 'npwd:lonely:getConfig',
  GET_FEED = 'npwd:lonely:getFeed',
  GET_CREATORS = 'npwd:lonely:getCreators',
  GET_CREATOR_PROFILE = 'npwd:lonely:getCreatorProfile',
  GET_MY_PROFILE = 'npwd:lonely:getMyProfile',
  SUBSCRIBE = 'npwd:lonely:subscribe',
  UNLOCK_POST = 'npwd:lonely:unlockPost',
  CREATE_PROFILE = 'npwd:lonely:createProfile',
  UPDATE_PROFILE = 'npwd:lonely:updateProfile',
  CREATE_POST = 'npwd:lonely:createPost',
  DELETE_POST = 'npwd:lonely:deletePost',
  CHECK_ACCOUNT = 'npwd:lonely:checkAccount',
  CREATE_ACCOUNT = 'npwd:lonely:createAccount',
  LOGOUT = 'npwd:lonely:logout',
  TOGGLE_LIKE = 'npwd:lonely:toggleLike',
  GET_COMMENTS = 'npwd:lonely:getComments',
  ADD_COMMENT = 'npwd:lonely:addComment',
}
