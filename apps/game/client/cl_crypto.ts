import { CryptoEvents } from '@typings/crypto';
import { RegisterNuiProxy } from './cl_utils';

RegisterNuiProxy(CryptoEvents.FETCH);
RegisterNuiProxy(CryptoEvents.TRADE);
