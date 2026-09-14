export interface MusicTrack {
  id: number;
  title: string;
  url: string;
}

/** How the track is being heard. Speaker is audible to anyone nearby. */
export type MusicMode = 'earbuds' | 'speaker';

export interface MusicNowPlaying {
  id: number;
  title: string;
  url: string;
  mode: MusicMode;
  volume: number;
  paused: boolean;
}

export interface MusicState {
  tracks: MusicTrack[];
  current: MusicNowPlaying | null;
}

export interface MusicResult {
  ok: boolean;
  message?: string;
  current?: MusicNowPlaying | null;
}

export enum MusicEvents {
  FETCH = 'npwd:music:fetch',
  ADD = 'npwd:music:add',
  REMOVE = 'npwd:music:remove',
  PLAY = 'npwd:music:play',
  TOGGLE_PAUSE = 'npwd:music:togglePause',
  STOP = 'npwd:music:stop',
  SET_VOLUME = 'npwd:music:setVolume',
}
