import { CryptoCoin } from '@typings/crypto';

// The market. Prices are server-authoritative and shared by everyone: the same
// tick drives every player's app, so two people looking at QBIT see the same
// number. Nothing here is persisted -- a restart reseeds the market, which is
// fine for a roleplay economy and avoids a table that only holds noise.

const TICK_MS = 30000;
const HISTORY_POINTS = 48;

interface CoinDef {
  symbol: string;
  name: string;
  seed: number;
  /** How hard it swings per tick, as a fraction of price. */
  volatility: number;
}

const COINS: CoinDef[] = [
  { symbol: 'QBIT', name: 'Qubit', seed: 4200, volatility: 0.035 },
  { symbol: 'LSC', name: 'Los Santos Coin', seed: 128, volatility: 0.06 },
  { symbol: 'GOAT', name: 'GoatCoin', seed: 12.5, volatility: 0.11 },
  { symbol: 'TIDE', name: 'Tidal', seed: 780, volatility: 0.022 },
];

interface MarketCoin extends CoinDef {
  price: number;
  history: number[];
}

const market = new Map<string, MarketCoin>(
  COINS.map((def) => [
    def.symbol,
    {
      ...def,
      price: def.seed,
      // Seeded flat so the first sparkline isn't a lie about history we never had.
      history: new Array(HISTORY_POINTS).fill(def.seed),
    },
  ]),
);

/** Random walk with a weak pull back toward the seed, so nothing runs away. */
const step = (coin: MarketCoin): void => {
  const drift = (coin.seed - coin.price) / coin.seed * 0.05;
  const shock = (Math.random() * 2 - 1) * coin.volatility;
  const next = coin.price * (1 + drift + shock);

  coin.price = Math.max(coin.seed * 0.15, Number(next.toFixed(next < 10 ? 4 : 2)));
  coin.history.push(coin.price);
  if (coin.history.length > HISTORY_POINTS) coin.history.shift();
};

setInterval(() => market.forEach(step), TICK_MS);

export const getCoins = (): CryptoCoin[] =>
  [...market.values()].map((coin) => {
    const then = coin.history[0] || coin.price;
    return {
      symbol: coin.symbol,
      name: coin.name,
      price: coin.price,
      change24h: then ? Number((((coin.price - then) / then) * 100).toFixed(2)) : 0,
      history: [...coin.history],
    };
  });

export const getPrice = (symbol: string): number | null => market.get(symbol)?.price ?? null;
