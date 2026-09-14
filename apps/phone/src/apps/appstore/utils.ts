export const formatStoreSize = (sizeKb?: number): string => {
  if (!sizeKb) return '—';
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
};
