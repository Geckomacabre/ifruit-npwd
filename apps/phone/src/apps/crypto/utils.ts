import { CryptoPortfolio } from '@typings/crypto';

export const money = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

/** Coin amounts need more places than dollars, but not eight of them on screen. */
export const coins = (value: number): string =>
  value.toLocaleString('en-US', { maximumFractionDigits: 6 });

export const percent = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

/** An SVG path across the price history, normalised to the given box. */
export const sparkline = (history: number[], width: number, height: number): string => {
  if (history.length < 2) return '';

  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = max - min || 1;
  const stepX = width / (history.length - 1);

  return history
    .map((price, i) => {
      const x = (i * stepX).toFixed(2);
      const y = (height - ((price - min) / span) * height).toFixed(2);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join('');
};

// Browser-preview stand-in; fetchNui only returns it outside the game.
const walk = (seed: number, vol: number): number[] => {
  const out: number[] = [];
  let price = seed;
  for (let i = 0; i < 48; i += 1) {
    price = price * (1 + (Math.sin(i / 3) * vol) / 2);
    out.push(Number(price.toFixed(2)));
  }
  return out;
};

export const BrowserPortfolio: CryptoPortfolio = {
  bankBalance: 18400,
  totalValue: 5231.4,
  coins: [
    { symbol: 'QBIT', name: 'Qubit', price: 4310.22, change24h: 2.61, history: walk(4200, 0.04) },
    { symbol: 'LSC', name: 'Los Santos Coin', price: 121.4, change24h: -5.12, history: walk(128, 0.07) },
    { symbol: 'GOAT', name: 'GoatCoin', price: 14.88, change24h: 18.4, history: walk(12.5, 0.12) },
    { symbol: 'TIDE', name: 'Tidal', price: 774.5, change24h: -0.72, history: walk(780, 0.02) },
  ],
  holdings: [
    { symbol: 'QBIT', amount: 1.1, value: 4741.24, costBasis: 4400 },
    { symbol: 'GOAT', amount: 32.94, value: 490.16, costBasis: 600 },
  ],
  trades: [
    { id: 3, symbol: 'GOAT', side: 'buy', amount: 32.94, price: 18.21, total: 600, createdAt: 1757880000000 },
    { id: 2, symbol: 'QBIT', side: 'buy', amount: 1.1, price: 4000, total: 4400, createdAt: 1757820000000 },
    { id: 1, symbol: 'LSC', side: 'sell', amount: 4, price: 130, total: 520, createdAt: 1757760000000 },
  ],
};
