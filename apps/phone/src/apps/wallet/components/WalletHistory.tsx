import React, { useCallback, useEffect, useState } from 'react';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { WALLET_PAGE_SIZE, WalletEvents, WalletTransaction } from '@typings/wallet';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { BrowserWalletOverview } from '../utils/constants';
import { TransactionList } from './TransactionList';

export const WalletHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (nextPage: number) => {
    setLoading(true);

    try {
      const resp = await fetchNui<ServerPromiseResp<WalletTransaction[]>>(
        WalletEvents.FETCH_TRANSACTIONS,
        { page: nextPage },
        { status: 'ok', data: nextPage === 0 ? BrowserWalletOverview.recentTransactions : [] },
      );

      if (resp.status === 'ok') {
        setTransactions((previous) => (nextPage === 0 ? resp.data : [...previous, ...resp.data]));
        setHasMore(resp.data.length === WALLET_PAGE_SIZE);
        setPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  return (
    <div className="buckme-screen">
      <header className="buckme-header">
        <h3>History</h3>
      </header>

      {loading && !transactions.length ? (
        <LoadingSpinner />
      ) : (
        <TransactionList transactions={transactions} />
      )}

      {hasMore && (
        <button
          type="button"
          className="buckme-link buckme-spaced"
          disabled={loading}
          onClick={() => loadPage(page + 1)}
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
};
