import { CryptoEvents, CryptoPortfolio, CryptoTradeDTO } from '@typings/crypto';
import CryptoService from './crypto.service';
import { CryptoDB } from './crypto.database';
import { cryptoLogger } from './crypto.utils';
import { onNetPromise } from '../lib/PromiseNetEvents/onNetPromise';

CryptoDB.ensureTables().catch((e) =>
  cryptoLogger.error(`Could not create the crypto tables, Error: ${e.message}`),
);

onNetPromise<void, CryptoPortfolio>(CryptoEvents.FETCH, (reqObj, resp) => {
  CryptoService.handleFetch(reqObj, resp).catch((e) => {
    cryptoLogger.error(`Error occurred in fetch crypto event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});

onNetPromise<CryptoTradeDTO, CryptoPortfolio>(CryptoEvents.TRADE, (reqObj, resp) => {
  CryptoService.handleTrade(reqObj, resp).catch((e) => {
    cryptoLogger.error(`Error occurred in crypto trade event (${reqObj.source}), Error: ${e.message}`);
    resp({ status: 'error', errorMsg: 'UNKNOWN_ERROR' });
  });
});
