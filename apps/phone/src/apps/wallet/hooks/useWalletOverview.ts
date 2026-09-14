import { useCallback } from 'react';
import { atom, useRecoilState } from 'recoil';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { WalletEvents, WalletOverview } from '@typings/wallet';
import { BrowserWalletOverview } from '../utils/constants';

const overviewState = atom<WalletOverview | null>({
  key: 'wallet.overview',
  default: null,
});

export const useWalletOverview = () => {
  const [overview, setOverview] = useRecoilState(overviewState);

  const refresh = useCallback(async () => {
    try {
      const resp = await fetchNui<ServerPromiseResp<WalletOverview>>(
        WalletEvents.FETCH_OVERVIEW,
        undefined,
        { status: 'ok', data: BrowserWalletOverview },
      );
      if (resp.status === 'ok') setOverview(resp.data);
    } catch (e) {
      console.error(e);
    }
  }, [setOverview]);

  return { overview, refresh };
};
