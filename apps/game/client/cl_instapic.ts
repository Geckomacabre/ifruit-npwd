import { InstaPicEvents } from '@typings/instapic';
import { RegisterNuiProxy } from './cl_utils';

RegisterNuiProxy(InstaPicEvents.FETCH);
RegisterNuiProxy(InstaPicEvents.FETCH_MINE);
RegisterNuiProxy(InstaPicEvents.CREATE);
RegisterNuiProxy(InstaPicEvents.DELETE);
RegisterNuiProxy(InstaPicEvents.TOGGLE_LIKE);
