import React, { useCallback, useEffect, useState } from 'react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { ServerPromiseResp } from '@typings/common';
import { CryptoCoin, CryptoEvents, CryptoPortfolio } from '@typings/crypto';
import { TradeSheet } from './components/TradeSheet';
import { BrowserPortfolio, coins, money, percent, sparkline } from './utils';

const REFRESH_MS = 15000;

const TRADE_ERROR: Record<string, string> = {
  UNKNOWN_COIN: 'That coin is not listed.',
  INVALID_AMOUNT: 'Enter a valid amount.',
  INSUFFICIENT_FUNDS: 'Not enough in the bank.',
  INSUFFICIENT_COINS: "You don't hold that many.",
};

export const CryptoApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [portfolio, setPortfolio] = useState<CryptoPortfolio | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const resp = await fetchNui<ServerPromiseResp<CryptoPortfolio>>(CryptoEvents.FETCH, undefined, {
      status: 'ok',
      data: BrowserPortfolio,
    });
    if (resp.status === 'ok' && resp.data) setPortfolio(resp.data);
  }, []);

  useEffect(() => {
    load().catch(console.error);
    // The market ticks server-side, so the app just re-reads it.
    const timer = window.setInterval(() => load().catch(console.error), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  if (!portfolio) {
    return (
      <AppWrapper id="crypto-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const holdingFor = (symbol: string) => portfolio.holdings.find((h) => h.symbol === symbol);
  const selectedCoin = portfolio.coins.find((c) => c.symbol === selected);

  const trade = async (side: 'buy' | 'sell', amount: number) => {
    if (!selectedCoin) return;
    setBusy(true);
    try {
      const resp = await fetchNui<ServerPromiseResp<CryptoPortfolio>>(
        CryptoEvents.TRADE,
        { symbol: selectedCoin.symbol, side, amount },
        { status: 'ok', data: BrowserPortfolio },
      );

      if (resp.status !== 'ok' || !resp.data) {
        addAlert({ message: TRADE_ERROR[resp.errorMsg ?? ''] ?? 'That trade failed.', type: 'error' });
        return;
      }

      setPortfolio(resp.data);
      setSelected(null);
      addAlert({
        message: side === 'buy' ? `Bought ${selectedCoin.symbol}.` : `Sold ${selectedCoin.symbol}.`,
        type: 'success',
      });
    } finally {
      setBusy(false);
    }
  };

  const invested = portfolio.holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const pnl = portfolio.totalValue - invested;

  return (
    <AppWrapper id="crypto-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="px-4 pb-3 pt-2">
          <h1 className="text-3xl font-bold">Crypto</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <p className="text-sm text-neutral-500">Portfolio value</p>
            <p className="text-3xl font-bold">{money(portfolio.totalValue)}</p>
            {invested > 0 && (
              <p className={cn('text-sm font-semibold', pnl >= 0 ? 'text-green-500' : 'text-red-500')}>
                {pnl >= 0 ? '+' : ''}
                {money(pnl)} all time
              </p>
            )}
            <p className="mt-2 text-xs text-neutral-500">Bank {money(portfolio.bankBalance)}</p>
          </div>

          {portfolio.holdings.length > 0 && (
            <>
              <h2 className="mb-2 text-sm font-semibold text-neutral-500">Holdings</h2>
              <div className="mb-4 flex flex-col gap-2">
                {portfolio.holdings.map((holding) => {
                  const coin = portfolio.coins.find((c) => c.symbol === holding.symbol);
                  return (
                    <button
                      key={holding.symbol}
                      type="button"
                      onClick={() => setSelected(holding.symbol)}
                      className="flex items-center justify-between rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-neutral-800"
                    >
                      <span>
                        <span className="block font-semibold">{holding.symbol}</span>
                        <span className="text-xs text-neutral-500">
                          {coins(holding.amount)} coins
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold">{money(holding.value)}</span>
                        {coin && (
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              coin.change24h >= 0 ? 'text-green-500' : 'text-red-500',
                            )}
                          >
                            {percent(coin.change24h)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <h2 className="mb-2 text-sm font-semibold text-neutral-500">Market</h2>
          <div className="flex flex-col gap-2">
            {portfolio.coins.map((coin: CryptoCoin) => (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => setSelected(coin.symbol)}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-neutral-800"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{coin.symbol}</span>
                  <span className="truncate text-xs text-neutral-500">{coin.name}</span>
                </span>

                <svg viewBox="0 0 80 28" className="h-7 w-20 shrink-0" preserveAspectRatio="none">
                  <path
                    d={sparkline(coin.history, 80, 28)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}
                  />
                </svg>

                <span className="shrink-0 text-right">
                  <span className="block font-semibold">{money(coin.price)}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      coin.change24h >= 0 ? 'text-green-500' : 'text-red-500',
                    )}
                  >
                    {percent(coin.change24h)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {portfolio.trades.length > 0 && (
            <>
              <h2 className="mb-2 mt-4 text-sm font-semibold text-neutral-500">Recent trades</h2>
              <div className="flex flex-col gap-2">
                {portfolio.trades.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-sm dark:bg-neutral-800"
                  >
                    <span>
                      <span className={cn('font-semibold', t.side === 'buy' ? 'text-green-500' : 'text-red-500')}>
                        {t.side === 'buy' ? 'Bought' : 'Sold'}
                      </span>{' '}
                      {coins(t.amount)} {t.symbol}
                    </span>
                    <span className="font-semibold">{money(t.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {selectedCoin && (
          <TradeSheet
            coin={selectedCoin}
            holding={holdingFor(selectedCoin.symbol)}
            bankBalance={portfolio.bankBalance}
            busy={busy}
            onClose={() => setSelected(null)}
            onTrade={trade}
          />
        )}
      </div>
    </AppWrapper>
  );
};
