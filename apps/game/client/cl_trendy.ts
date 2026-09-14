import { TrendyEvents } from '@typings/trendy';
import { RegisterNuiProxy } from './cl_utils';

RegisterNuiProxy(TrendyEvents.FETCH);
RegisterNuiProxy(TrendyEvents.CREATE);
RegisterNuiProxy(TrendyEvents.DELETE);
RegisterNuiProxy(TrendyEvents.TOGGLE_LIKE);
