export interface CryptoCoin {
  /** Short ticker, e.g. QBIT. Also the primary key everywhere else. */
  symbol: string;
  name: string;
  /** Current price per whole coin, in dollars. */
  price: number;
  /** Percentage change against the price 24h ago. */
  change24h: number;
  /** Oldest → newest closing prices, for the sparkline. */
  history: number[];
}

export interface CryptoHolding {
  symbol: string;
  /** Coins held. Fractional. */
  amount: number;
  /** What the holding is worth at the current price. */
  value: number;
  /** Total dollars spent acquiring the current position. */
  costBasis: number;
}

export interface CryptoTrade {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  /** Price per coin at the time of the trade. */
  price: number;
  /** Dollars moved. */
  total: number;
  createdAt: number;
}

export interface CryptoPortfolio {
  bankBalance: number;
  coins: CryptoCoin[];
  holdings: CryptoHolding[];
  trades: CryptoTrade[];
  /** Current worth of every holding combined. */
  totalValue: number;
}

export interface CryptoTradeDTO {
  symbol: string;
  side: 'buy' | 'sell';
  /** Dollars to spend when buying, coins to sell when selling. */
  amount: number;
}

export type CryptoError =
  | 'UNKNOWN_COIN'
  | 'INVALID_AMOUNT'
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_COINS'
  | 'UNKNOWN_ERROR';

export enum CryptoEvents {
  FETCH = 'npwd:crypto:fetch',
  TRADE = 'npwd:crypto:trade',
}
