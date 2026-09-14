import {
  TrendyCreateDTO,
  TrendyEvents,
  TrendyIdDTO,
  TrendyLikeResult,
  TrendyPost,
} from '@typings/trendy';
import TrendyService from './trendy.service';
import { TrendyDB } from './trendy.database';
import { trendyLogger } from './trendy.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

TrendyDB.ensureTables().catch((e) =>
  trendyLogger.error(`Could not create the Trendy tables, Error: ${e.message}`),
);

onNetPromise<void, TrendyPost[]>(TrendyEvents.FETCH, (reqObj, resp) => {
  TrendyService.handleFetch(reqObj, resp).catch((e) => {
    trendyLogger.error(`Error in Trendy fetch (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<TrendyCreateDTO, TrendyPost>(TrendyEvents.CREATE, (reqObj, resp) => {
  TrendyService.handleCreate(reqObj, resp).catch((e) => {
    trendyLogger.error(`Error in Trendy create (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<TrendyIdDTO, void>(TrendyEvents.DELETE, (reqObj, resp) => {
  TrendyService.handleDelete(reqObj, resp).catch((e) => {
    trendyLogger.error(`Error in Trendy delete (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<TrendyIdDTO, TrendyLikeResult>(TrendyEvents.TOGGLE_LIKE, (reqObj, resp) => {
  TrendyService.handleToggleLike(reqObj, resp).catch((e) => {
    trendyLogger.error(`Error in Trendy like (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});
