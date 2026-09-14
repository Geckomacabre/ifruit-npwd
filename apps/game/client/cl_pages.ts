import { PagesEvents } from '@typings/pages';
import { RegisterNuiProxy } from './cl_utils';

RegisterNuiProxy(PagesEvents.FETCH);
RegisterNuiProxy(PagesEvents.CREATE);
RegisterNuiProxy(PagesEvents.DELETE);
