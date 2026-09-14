import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/css';
import { IApp } from '@os/apps/config/apps';
import { formatStoreSize } from '../utils';

interface AppStoreDetailProps {
  app: IApp;
  installed: boolean;
  onClose: () => void;
  onToggleInstall: (app: IApp) => void;
  onOpen: (app: IApp) => void;
}

export const AppStoreDetail: React.FC<AppStoreDetailProps> = ({
  app,
  installed,
  onClose,
  onToggleInstall,
  onOpen,
}) => {
  const [t] = useTranslation();

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="max-h-[85%] overflow-y-auto rounded-t-[28px] bg-neutral-100 px-5 pb-10 pt-3 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-400/60" />
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px]"
              style={{ backgroundColor: app.backgroundColor }}
            >
              {app.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight">{t(app.nameLocale)}</h2>
              <p className="text-sm text-neutral-500">EnhancedMafia</p>
            </div>
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

        <button
          type="button"
          onClick={() => (installed ? onOpen(app) : onToggleInstall(app))}
          className={cn(
            'mb-6 w-full rounded-full py-3 text-center font-semibold',
            installed ? 'bg-blue-500 text-white' : 'bg-neutral-200 text-blue-500 dark:bg-neutral-800',
          )}
        >
          {installed ? 'Open' : 'Get'}
        </button>

        {app.storeDescription && (
          <p className="mb-6 whitespace-pre-wrap break-words leading-relaxed">{app.storeDescription}</p>
        )}

        <div className="rounded-2xl bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <span className="text-neutral-500">Provider</span>
            <span className="font-medium">EnhancedMafia</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-neutral-500">Size</span>
            <span className="font-medium">{formatStoreSize(app.storeSizeKb)}</span>
          </div>
        </div>

        {installed && (
          <button
            type="button"
            onClick={() => onToggleInstall(app)}
            className="mt-6 w-full rounded-2xl bg-neutral-200 py-3 text-center font-semibold text-red-500 dark:bg-neutral-800"
          >
            Remove App
          </button>
        )}
      </div>
    </div>
  );
};
