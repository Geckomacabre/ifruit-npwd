import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppWrapper } from '@ui/components';
import { NPWDSearchInput } from '@ui/components/Input';
import { useApps } from '@os/apps/hooks/useApps';
import { useSettings } from '@apps/settings/hooks/useSettings';
import { IApp } from '@os/apps/config/apps';
import { AppStoreDetail } from './components/AppStoreDetail';
import { formatStoreSize } from './utils';

export const AppStoreApp: React.FC = () => {
  const history = useHistory();
  const [t] = useTranslation();
  const { apps } = useApps();
  const [settings, setSettings] = useSettings();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<IApp | null>(null);

  const removableApps = useMemo(() => apps.filter((app) => app.removable), [apps]);

  // Undefined installedApps means the player hasn't touched the store yet,
  // so every removable app they already had counts as installed.
  const installedIds = useMemo(
    () => new Set(settings.installedApps ?? removableApps.map((app) => app.id)),
    [settings.installedApps, removableApps],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return removableApps;
    return removableApps.filter((app) =>
      [t(app.nameLocale), app.storeDescription ?? ''].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [removableApps, search, t]);

  const toggleInstall = (app: IApp) => {
    const next = new Set(installedIds);
    if (next.has(app.id)) {
      next.delete(app.id);
    } else {
      next.add(app.id);
    }
    setSettings({ ...settings, installedApps: Array.from(next) });
  };

  const openApp = (app: IApp) => {
    setSelected(null);
    history.push(app.path);
  };

  return (
    <AppWrapper id="appstore-app">
      <div className="relative flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="px-4 pb-2 pt-2">
          <h1 className="text-3xl font-bold">App Store</h1>
        </header>

        <div className="px-4 pb-3">
          <NPWDSearchInput
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {visible.length === 0 && (
            <p className="py-16 text-center text-neutral-500">No apps match that.</p>
          )}

          <div className="flex flex-col gap-3">
            {visible.map((app) => {
              const installed = installedIds.has(app.id);
              return (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm dark:bg-neutral-800"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ backgroundColor: app.backgroundColor }}
                  >
                    {app.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t(app.nameLocale)}</p>
                    {app.storeDescription && (
                      <p className="line-clamp-1 text-sm text-neutral-600 dark:text-neutral-300">
                        {app.storeDescription}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-neutral-500">{formatStoreSize(app.storeSizeKb)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (installed) {
                        openApp(app);
                      } else {
                        toggleInstall(app);
                      }
                    }}
                    className={
                      installed
                        ? 'shrink-0 rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white'
                        : 'shrink-0 rounded-full bg-neutral-200 px-4 py-1.5 text-sm font-semibold text-blue-500 dark:bg-neutral-700'
                    }
                  >
                    {installed ? 'Open' : 'Get'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {selected && (
          <AppStoreDetail
            app={selected}
            installed={installedIds.has(selected.id)}
            onClose={() => setSelected(null)}
            onToggleInstall={toggleInstall}
            onOpen={openApp}
          />
        )}
      </div>
    </AppWrapper>
  );
};
