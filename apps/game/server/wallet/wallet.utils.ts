import { mainLogger } from '../sv_logger';

export const walletLogger = mainLogger.child({ module: 'wallet' });

const MOD = 2147483647;

// (a * b) % MOD without leaving double precision. a * b can reach 2^61, which a
// JS number cannot hold exactly, so b is split into 16-bit halves and every
// intermediate stays under 2^53.
const mulMod = (a: number, b: number): number => {
  const hi = Math.floor(b / 65536);
  const lo = b % 65536;
  return ((((a * hi) % MOD) * 65536) % MOD + a * lo) % MOD;
};

/**
 * Port of lb-phone BuckMe's DeterministicDigits (server/apps/framework/wallet.lua):
 * the same seed yields the same digits, so a character keeps the card number
 * and CVV they already had before the move to NPWD.
 */
export const deterministicDigits = (seed: string, length: number): string => {
  let hash = 5381;

  for (const byte of Buffer.from(seed, 'utf8')) {
    hash = (hash * 33 + byte) % MOD;
  }

  let digits = '';

  for (let i = 0; i < length; i++) {
    hash = (mulMod(hash, 1103515245) + 12345) % MOD;
    digits += String(hash % 10);
  }

  return digits;
};
