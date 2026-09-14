export interface VoiceMemo {
  id: number;
  name: string;
  url: string;
  /** Seconds, measured while recording. */
  duration: number;
  createdAt: number;
}

export interface VoiceMemoSaveDTO {
  name: string;
  url: string;
  duration: number;
}

export interface VoiceMemoRenameDTO {
  id: number;
  name: string;
}

export interface VoiceMemoIdDTO {
  id: number;
}

export const VOICE_MEMO_NAME_MAX = 50;
export const VOICE_MEMO_MAX_SECONDS = 600;

export enum VoiceMemoEvents {
  FETCH = 'npwd:voicememos:fetch',
  SAVE = 'npwd:voicememos:save',
  RENAME = 'npwd:voicememos:rename',
  DELETE = 'npwd:voicememos:delete',
}
