import { PagesCreateDTO, PagesEvents, PagesIdDTO, PagesPost } from '@typings/pages';
import PagesService from './pages.service';
import { PagesDB } from './pages.database';
import { pagesLogger } from './pages.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

PagesDB.ensureTable().catch((e) => pagesLogger.error(`Could not create npwd_pages_posts, Error: ${e.message}`));

onNetPromise<void, PagesPost[]>(PagesEvents.FETCH, (reqObj, resp) => {
  PagesService.handleFetch(reqObj, resp).catch((e) => {
    pagesLogger.error(`Error occurred in fetch pages event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<PagesCreateDTO, PagesPost>(PagesEvents.CREATE, (reqObj, resp) => {
  PagesService.handleCreate(reqObj, resp).catch((e) => {
    pagesLogger.error(`Error occurred in create page event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<PagesIdDTO, void>(PagesEvents.DELETE, (reqObj, resp) => {
  PagesService.handleDelete(reqObj, resp).catch((e) => {
    pagesLogger.error(`Error occurred in delete page event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});
