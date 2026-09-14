import { WalletError, WalletOverview } from '@typings/wallet';

export const HELP_GREETING = {
  from: 'bot' as const,
  text: "hi!! i'm BuckBot, your totally real customer support agent. i cannot actually help with anything, but i CAN pretend really convincingly. what's wrong?",
};

export const HELP_QUESTIONS = [
  {
    q: "Where's my money?",
    a: "your balance is currently on a spiritual journey to find itself. it'll be back when it's back. no eta. no refunds. no closure.",
  },
  {
    q: 'I got scammed',
    a: "that's called networking in Los Santos. have you tried scamming them back? we don't cover it either way but it might feel good.",
  },
  {
    q: 'My card got declined',
    a: 'declined cards build character. very cheap, very embarrassing character. have you tried being richer?',
  },
  {
    q: 'Talk to a real human',
    a: "humans are a premium feature we don't currently offer. please enjoy this crying emoji instead on the house: \u{1F62D}\u{1F62D}\u{1F62D}",
  },
];

export const REQUEST_POPUP = {
  title: 'Request Money',
  description: "Requesting money isn't available yet -- coming soon.",
};

const PAYMENT_ERRORS: Record<WalletError, string> = {
  INVALID_AMOUNT: 'Enter an amount between $1 and $1,000,000.',
  INSUFFICIENT_FUNDS: "You don't have enough for that.",
  NUMBER_NOT_FOUND: 'No BuckMe account uses that number.',
  SELF_TRANSFER: "You can't send money to yourself.",
  RECIPIENT_OFFLINE: 'They need to be in the city to get paid.',
  TRANSFER_FAILED: "The payment didn't go through. You were not charged.",
  BUSY: 'Still sending your last payment.',
};

export const paymentErrorText = (code?: string): string =>
  PAYMENT_ERRORS[code as WalletError] ?? 'Could not send payment.';

// Browser-only stand-in data; fetchNui returns it only outside the game.
export const BrowserWalletOverview: WalletOverview = {
  balance: 48213,
  cardholderName: 'JOHNNY KLEBITZ',
  cardLast4: '4821',
  cardCvv: '317',
  recentTransactions: [
    { id: 5, amount: 250, company: 'Trevor Philips', logo: null, timestamp: Date.now() - 3600e3 },
    { id: 4, amount: -89, company: 'Burger Shot', logo: null, timestamp: Date.now() - 7200e3 },
    { id: 3, amount: -1200, company: '5551234567', logo: null, timestamp: Date.now() - 86400e3 },
    { id: 2, amount: 3400, company: 'Snarf Global', logo: null, timestamp: Date.now() - 172800e3 },
    { id: 1, amount: -15, company: 'Bean Machine', logo: null, timestamp: Date.now() - 259200e3 },
  ],
};
