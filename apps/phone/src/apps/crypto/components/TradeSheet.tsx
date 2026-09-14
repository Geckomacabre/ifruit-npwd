import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@utils/css';
import { CryptoCoin, CryptoHolding } from '@typings/crypto';
import { coins, money, percent, sparkline } from '../utils';

interface TradeSheetProps {
  coin: CryptoCoin;
  holding?: CryptoHolding;
  bankBalance: number;
  busy: boolean;
  onClose: () => void;
  onTrade: (side: 'buy' | 'sell', amount: number) => void;
}

export const TradeSheet: React.FC<TradeSheetProps> = ({
  coin,
  holding,
  bankBalance,
  busy,
  onClose,
  onTrade,
}) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [value, setValue] = useState('');

  const owned = holding?.amount ?? 0;
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && parsed > 0;

  // Buying spends dollars, selling sends coins -- so the preview flips too.
  const preview = valid
    ? side === 'buy'
      ? `${coins(parsed / coin.price)} ${coin.symbol}`
      : money(parsed * coin.price)
    : null;

  const max = side === 'buy' ? bankBalance : owned;
  const overMax = valid && parsed > max;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="max-h-[88%] overflow-y-auto rounded-t-[28px] bg-neutral-100 px-5 pb-10 pt-3 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-400/60" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight">{coin.name}</h2>
            <p className="text-sm text-neutral-500">{coin.symbol}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-3xl font-bold">{money(coin.price)}</p>
        <p className={cn('text-sm font-semibold', coin.change24h >= 0 ? 'text-green-500' : 'text-red-500')}>
          {percent(coin.change24h)}
        </p>

        <svg viewBox="0 0 300 80" className="mt-3 h-20 w-full" preserveAspectRatio="none">
          <path
            d={sparkline(coin.history, 300, 80)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}
          />
        </svg>

        {holding && (
          <div className="mt-3 rounded-2xl bg-white p-4 dark:bg-neutral-800">
            <p className="text-sm text-neutral-500">You hold</p>
            <p className="text-lg font-semibold">
              {coins(holding.amount)} {coin.symbol}
            </p>
            <p className="text-sm text-neutral-500">
              {money(holding.value)} · cost {money(holding.costBasis)}
            </p>
          </div>
        )}

        <div className="mt-4 flex gap-1 rounded-full bg-neutral-200 p-1 dark:bg-neutral-800">
          {(['buy', 'sell'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSide(option);
                setValue('');
              }}
              className={cn(
                'flex-1 rounded-full py-1.5 text-sm font-semibold capitalize',
                side === option && 'bg-white text-black shadow dark:bg-neutral-600 dark:text-white',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm text-neutral-500">
          {side === 'buy' ? 'Amount to spend ($)' : `Coins to sell (${coin.symbol})`}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0"
          className="mt-1 w-full rounded-2xl bg-white p-3 text-lg outline-none dark:bg-neutral-800"
        />

        <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
          <span>
            {side === 'buy' ? `Bank ${money(bankBalance)}` : `Holding ${coins(owned)}`}
          </span>
          <button
            type="button"
            onClick={() => setValue(String(side === 'buy' ? Math.floor(bankBalance) : owned))}
            className="font-semibold text-blue-500"
          >
            Max
          </button>
        </div>

        {preview && <p className="mt-2 text-sm">You get about {preview}</p>}
        {overMax && (
          <p className="mt-2 text-sm text-red-500">
            {side === 'buy' ? 'More than your bank balance.' : 'More than you hold.'}
          </p>
        )}

        <button
          type="button"
          disabled={busy || !valid || overMax}
          onClick={() => onTrade(side, parsed)}
          className={cn(
            'mt-4 w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-50',
            side === 'buy' ? 'bg-green-500' : 'bg-red-500',
          )}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {coin.symbol}
        </button>
      </div>
    </div>
  );
};
