import React, { useCallback, useEffect, useState } from 'react';
import { Key, MapPin, UserMinus } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { HomeEvents, HomeProperty } from '@typings/home';
import { BrowserProperties, money, rentLabel } from './utils';

export const HomeApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [properties, setProperties] = useState<HomeProperty[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    const rows = await fetchNui<HomeProperty[]>(HomeEvents.FETCH, undefined, BrowserProperties);
    setProperties(Array.isArray(rows) ? rows : []);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const locate = async (property: HomeProperty) => {
    if (property.x === null || property.y === null) {
      addAlert({ message: 'No location on file for that one.', type: 'error' });
      return;
    }
    await fetchNui(HomeEvents.LOCATE, { x: property.x, y: property.y }, { ok: true });
    addAlert({ message: 'Waypoint set.', type: 'success' });
  };

  const revoke = async (property: HomeProperty, citizenid: string) => {
    const resp = await fetchNui<{ ok: boolean }>(
      HomeEvents.REVOKE_KEY,
      { propertyId: property.id, citizenid },
      { ok: true },
    );

    if (!resp?.ok) {
      addAlert({ message: 'Could not take that key back.', type: 'error' });
      return;
    }

    setProperties(
      (cur) =>
        cur?.map((p) =>
          p.id === property.id
            ? { ...p, keyholders: p.keyholders.filter((k) => k.citizenid !== citizenid) }
            : p,
        ) ?? cur,
    );
    addAlert({ message: 'Key revoked.', type: 'success' });
  };

  if (!properties) {
    return (
      <AppWrapper id="home-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper id="home-app">
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="px-4 pb-3 pt-2">
          <h1 className="text-3xl font-bold">Home</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {properties.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-500">
              You don&apos;t own a property, and nobody has given you a key.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {properties.map((property) => {
              const expanded = open === property.id;

              return (
                <div key={property.id} className="rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : property.id)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{property.name}</span>
                      <span className="text-sm text-neutral-500">
                        {property.owned ? 'Owned' : 'Key holder'}
                        {property.rentInterval ? ` · ${rentLabel(property.rentInterval)}` : ''}
                      </span>
                    </span>
                    {property.price > 0 && (
                      <span className="shrink-0 text-sm font-semibold">{money(property.price)}</span>
                    )}
                  </button>

                  {expanded && (
                    <div className="border-t border-neutral-200 px-4 pb-4 pt-3 dark:border-neutral-700">
                      <button
                        type="button"
                        onClick={() => locate(property)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-2 text-sm font-semibold text-white"
                      >
                        <MapPin size={16} /> Set waypoint
                      </button>

                      <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
                        <Key size={14} /> Keys
                      </p>

                      {property.keyholders.length === 0 && (
                        <p className="mt-1 text-sm text-neutral-500">Nobody else has a key.</p>
                      )}

                      <div className="mt-1 flex flex-col gap-1">
                        {property.keyholders.map((holder) => (
                          <div
                            key={holder.citizenid}
                            className="flex items-center justify-between rounded-xl bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-700"
                          >
                            <span className="truncate">{holder.name}</span>
                            {/* Only the owner can take a key back. */}
                            {property.owned && (
                              <button
                                type="button"
                                aria-label={`Revoke ${holder.name}`}
                                onClick={() => revoke(property, holder.citizenid)}
                                className="shrink-0 text-red-500"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppWrapper>
  );
};
