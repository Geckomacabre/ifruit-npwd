import {
  VoiceMemo,
  VoiceMemoEvents,
  VoiceMemoIdDTO,
  VoiceMemoRenameDTO,
  VoiceMemoSaveDTO,
} from '@typings/voicememos';
import VoiceMemosService from './voicememos.service';
import { VoiceMemosDB } from './voicememos.database';
import { voiceMemosLogger } from './voicememos.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

VoiceMemosDB.ensureTable().catch((e) =>
  voiceMemosLogger.error(`Could not create npwd_voice_memos, Error: ${e.message}`),
);

onNetPromise<void, VoiceMemo[]>(VoiceMemoEvents.FETCH, (reqObj, resp) => {
  VoiceMemosService.handleFetch(reqObj, resp).catch((e) => {
    voiceMemosLogger.error(`Error occurred in fetch memos event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<VoiceMemoSaveDTO, VoiceMemo>(VoiceMemoEvents.SAVE, (reqObj, resp) => {
  VoiceMemosService.handleSave(reqObj, resp).catch((e) => {
    voiceMemosLogger.error(`Error occurred in save memo event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<VoiceMemoRenameDTO, void>(VoiceMemoEvents.RENAME, (reqObj, resp) => {
  VoiceMemosService.handleRename(reqObj, resp).catch((e) => {
    voiceMemosLogger.error(`Error occurred in rename memo event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<VoiceMemoIdDTO, void>(VoiceMemoEvents.DELETE, (reqObj, resp) => {
  VoiceMemosService.handleDelete(reqObj, resp).catch((e) => {
    voiceMemosLogger.error(`Error occurred in delete memo event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});
