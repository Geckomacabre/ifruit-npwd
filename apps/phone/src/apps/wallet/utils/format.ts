import dayjs from 'dayjs';

export const formatMoney = (amount: number): string =>
  `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString('en-US')}`;

export const formatTimestamp = (timestamp: number): string =>
  dayjs(timestamp).format('MMM D, h:mm A');

// Payments to someone with no character name are logged under their number.
export const formatCounterparty = (name: string): string => {
  const digits = name.match(/^(\d{3})(\d{3})(\d{4})$/);
  return digits ? `(${digits[1]}) ${digits[2]}-${digits[3]}` : name;
};
