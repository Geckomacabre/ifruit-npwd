import { VoiceMemoEvents } from '@typings/voicememos';
import { RegisterNuiProxy } from './cl_utils';

RegisterNuiProxy(VoiceMemoEvents.FETCH);
RegisterNuiProxy(VoiceMemoEvents.SAVE);
RegisterNuiProxy(VoiceMemoEvents.RENAME);
RegisterNuiProxy(VoiceMemoEvents.DELETE);
