import { walletLogger } from './wallet.utils';

// BuckMe has no ledger of its own: the balance is the framework's bank account,
// read and written through the framework's exports.
const framework = GetConvar('npwd:framework', 'standalone');
const exp = global.exports;

const qbPlayer = (src: number) => exp['qb-core'].GetCoreObject().Functions.GetPlayer(src);

if (framework !== 'qbx' && framework !== 'qbcore') {
  walletLogger.warn(
    `BuckMe has no money bridge for framework "${framework}"; balances read as 0 and payments fail`,
  );
}

export const getBankBalance = (src: number): number => {
  if (framework === 'qbx') return Number(exp.qbx_core.GetMoney(src, 'bank')) || 0;
  if (framework === 'qbcore') return Number(qbPlayer(src)?.PlayerData.money.bank) || 0;
  return 0;
};

export const removeBankMoney = (src: number, amount: number, reason: string): boolean => {
  if (framework === 'qbx') return exp.qbx_core.RemoveMoney(src, 'bank', amount, reason) === true;
  if (framework === 'qbcore') return qbPlayer(src)?.Functions.RemoveMoney('bank', amount, reason) === true;
  return false;
};

export const addBankMoney = (src: number, amount: number, reason: string): boolean => {
  if (framework === 'qbx') return exp.qbx_core.AddMoney(src, 'bank', amount, reason) === true;
  if (framework === 'qbcore') return qbPlayer(src)?.Functions.AddMoney('bank', amount, reason) === true;
  return false;
};
