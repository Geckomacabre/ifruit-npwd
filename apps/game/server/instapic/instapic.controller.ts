import {
  InstaPicCreateDTO,
  InstaPicEvents,
  InstaPicIdDTO,
  InstaPicLikeResult,
  InstaPicPost,
} from '@typings/instapic';
import InstaPicService from './instapic.service';
import { InstaPicDB } from './instapic.database';
import { instapicLogger } from './instapic.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

InstaPicDB.ensureTables().catch((e) =>
  instapicLogger.error(`Could not create the InstaPic tables, Error: ${e.message}`),
);

onNetPromise<void, InstaPicPost[]>(InstaPicEvents.FETCH, (reqObj, resp) => {
  InstaPicService.handleFetch(reqObj, resp).catch((e) => {
    instapicLogger.error(`Error in InstaPic fetch (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<void, InstaPicPost[]>(InstaPicEvents.FETCH_MINE, (reqObj, resp) => {
  InstaPicService.handleFetchMine(reqObj, resp).catch((e) => {
    instapicLogger.error(`Error in InstaPic fetchMine (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<InstaPicCreateDTO, InstaPicPost>(InstaPicEvents.CREATE, (reqObj, resp) => {
  InstaPicService.handleCreate(reqObj, resp).catch((e) => {
    instapicLogger.error(`Error in InstaPic create (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<InstaPicIdDTO, void>(InstaPicEvents.DELETE, (reqObj, resp) => {
  InstaPicService.handleDelete(reqObj, resp).catch((e) => {
    instapicLogger.error(`Error in InstaPic delete (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});

onNetPromise<InstaPicIdDTO, InstaPicLikeResult>(InstaPicEvents.TOGGLE_LIKE, (reqObj, resp) => {
  InstaPicService.handleToggleLike(reqObj, resp).catch((e) => {
    instapicLogger.error(`Error in InstaPic like (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'GENERIC_DB_ERROR' });
  });
});
