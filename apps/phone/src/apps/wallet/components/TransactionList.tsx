import React from 'react';
import { WalletTransaction } from '@typings/wallet';
import { formatCounterparty, formatMoney, formatTimestamp } from '../utils/format';

interface TransactionListProps {
  transactions: WalletTransaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  if (!transactions.length) {
    return (
      <div className="buckme-tx-list">
        <div className="buckme-empty">No activity yet.</div>
      </div>
    );
  }

  return (
    <div className="buckme-tx-list">
      {transactions.map((transaction) => {
        const incoming = transaction.amount > 0;
        const title = formatCounterparty(transaction.company);

        return (
          <div className="buckme-tx" key={transaction.id}>
            <div className="buckme-tx-avatar">
              {transaction.logo ? <img src={transaction.logo} alt="" /> : title.charAt(0).toUpperCase()}
            </div>
            <div className="buckme-tx-body">
              <span className="buckme-tx-title">{title}</span>
              <span className="buckme-tx-time">{formatTimestamp(transaction.timestamp)}</span>
            </div>
            <span className={`buckme-tx-amount ${incoming ? 'is-incoming' : ''}`}>
              {incoming ? '+' : '-'}
              {formatMoney(Math.abs(transaction.amount))}
            </span>
          </div>
        );
      })}
    </div>
  );
};
