import { config } from '@npwd/config/server';
import {
  VOICE_MEMO_MAX_SECONDS,
  VOICE_MEMO_NAME_MAX,
  VoiceMemo,
  VoiceMemoIdDTO,
  VoiceMemoRenameDTO,
  VoiceMemoSaveDTO,
} from '@typings/voicememos';
import PlayerService from '../players/player.service';
import { PromiseEventResp, PromiseRequest } from '../lib/PromiseNetEvents/promise.types';
import { VoiceMemosDB, _VoiceMemosDB } from './voicememos.database';
import { voiceMemosLogger } from './voicememos.utils';

const cleanName = (value: unknown): string =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, VOICE_MEMO_NAME_MAX);

// Recordings are uploaded by the phone to the configured voice host before they
// reach here, so only https links on the server's allowed media hosts are kept.
const isAllowedUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 500) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      config.imageSafety.safeImageUrls.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    );
  } catch (e) {
    return false;
  }
};

class _VoiceMemosService {
  private readonly memosDB: _VoiceMemosDB;

  constructor() {
    this.memosDB = VoiceMemosDB;
    voiceMemosLogger.debug('Voice memos service started');
  }

  async handleFetch(reqObj: PromiseRequest<void>, resp: PromiseEventResp<VoiceMemo[]>) {
    try {
      const memos = await this.memosDB.fetchMemos(PlayerService.getIdentifier(reqObj.source));
      resp({ status: 'ok', data: memos });
    } catch (e) {
      voiceMemosLogger.error(`Error in handleFetch, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleSave(reqObj: PromiseRequest<VoiceMemoSaveDTO>, resp: PromiseEventResp<VoiceMemo>) {
    const { name, url, duration } = reqObj.data ?? ({} as VoiceMemoSaveDTO);

    if (!isAllowedUrl(url)) return resp({ status: 'error', errorMsg: 'INVALID_URL' });

    try {
      const memo = await this.memosDB.addMemo(
        PlayerService.getIdentifier(reqObj.source),
        cleanName(name) || 'New Recording',
        url,
        Math.max(0, Math.min(VOICE_MEMO_MAX_SECONDS, Math.round(Number(duration) || 0))),
      );
      resp({ status: 'ok', data: memo });
    } catch (e) {
      voiceMemosLogger.error(`Error in handleSave, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleRename(reqObj: PromiseRequest<VoiceMemoRenameDTO>, resp: PromiseEventResp<void>) {
    const name = cleanName(reqObj.data?.name);
    if (!name) return resp({ status: 'error', errorMsg: 'INVALID_NAME' });

    try {
      const updated = await this.memosDB.renameMemo(
        Number(reqObj.data?.id),
        PlayerService.getIdentifier(reqObj.source),
        name,
      );
      resp(updated ? { status: 'ok' } : { status: 'error', errorMsg: 'NOT_FOUND' });
    } catch (e) {
      voiceMemosLogger.error(`Error in handleRename, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }

  async handleDelete(reqObj: PromiseRequest<VoiceMemoIdDTO>, resp: PromiseEventResp<void>) {
    try {
      await this.memosDB.deleteMemo(Number(reqObj.data?.id), PlayerService.getIdentifier(reqObj.source));
      resp({ status: 'ok' });
    } catch (e) {
      voiceMemosLogger.error(`Error in handleDelete, ${e.message}`);
      resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
    }
  }
}

const VoiceMemosService = new _VoiceMemosService();
export default VoiceMemosService;
