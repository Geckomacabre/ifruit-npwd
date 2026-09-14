import React, { useCallback, useEffect, useState } from 'react';
import { Bike, Car, Lock, MapPin, Navigation, RefreshCw, Truck, Unlock } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { GARAGE_VALET_PRICE, GarageActionResp, GarageEvents, GarageVehicle } from '@typings/garage';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { actionErrorText, BrowserVehicles, locationText } from './utils';

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  if (category === 'motorcycles' || category === 'cycles') return <Bike size={22} />;
  if (['vans', 'commercial', 'industrial', 'utility'].includes(category)) return <Truck size={22} />;
  return <Car size={22} />;
};

const StatBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const colour = clamped > 60 ? 'bg-green-500' : clamped > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex-1">
      <div className="mb-1 flex justify-between text-[11px] text-neutral-500">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
        <div className={cn('h-full rounded-full', colour)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};

const SECONDARY_BUTTON =
  'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-100 py-2 text-sm font-semibold text-orange-500 disabled:opacity-50 dark:bg-neutral-700';

type Busy = { id: number; action: 'valet' | 'summon' | 'lock' } | null;

export const GarageApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const [vehicles, setVehicles] = useState<GarageVehicle[] | null>(null);
  const [busy, setBusy] = useState<Busy>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchNui<GarageVehicle[]>(GarageEvents.FETCH_VEHICLES, undefined, BrowserVehicles);
      setVehicles(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setVehicles([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (vehicle: GarageVehicle, action: NonNullable<Busy>['action'], task: () => Promise<void>) => {
    if (busy) return;
    setBusy({ id: vehicle.id, action });
    try {
      await task();
    } catch (e) {
      addAlert({ message: actionErrorText(), type: 'error' });
    } finally {
      setBusy(null);
    }
  };

  const locate = async (vehicle: GarageVehicle) => {
    const resp = await fetchNui<GarageActionResp>(GarageEvents.LOCATE, { plate: vehicle.plate }, { ok: true });
    addAlert(
      resp?.ok
        ? { message: `${vehicle.name} marked on your GPS.`, type: 'success' }
        : { message: "Couldn't find that car right now.", type: 'error' },
    );
  };

  const toggleLock = (vehicle: GarageVehicle) =>
    run(vehicle, 'lock', async () => {
      const resp = await fetchNui<GarageActionResp>(
        GarageEvents.TOGGLE_LOCK,
        { plate: vehicle.plate },
        { ok: true, locked: !vehicle.locked },
      );
      if (!resp?.ok) return addAlert({ message: actionErrorText(resp?.error), type: 'error' });

      setVehicles((list) => list?.map((v) => (v.id === vehicle.id ? { ...v, locked: !!resp.locked } : v)) ?? list);
      addAlert({ message: `${vehicle.name} ${resp.locked ? 'locked' : 'unlocked'}.`, type: 'success' });
    });

  const summon = (vehicle: GarageVehicle) =>
    run(vehicle, 'summon', async () => {
      const resp = await fetchNui<GarageActionResp>(GarageEvents.SUMMON, { plate: vehicle.plate }, { ok: true });
      addAlert(
        resp?.ok
          ? { message: `Your ${vehicle.name} is on its way to you.`, type: 'success' }
          : { message: actionErrorText(resp?.error), type: 'error' },
      );
    });

  const valet = (vehicle: GarageVehicle) =>
    run(vehicle, 'valet', async () => {
      const resp = await fetchNui<GarageActionResp>(GarageEvents.VALET, { id: vehicle.id }, { ok: true });
      if (!resp?.ok) return addAlert({ message: actionErrorText(resp?.error), type: 'error' });

      addAlert({ message: `A valet is bringing your ${vehicle.name}.`, type: 'success' });
      load();
    });

  const isBusy = (vehicle: GarageVehicle, action: NonNullable<Busy>['action']) =>
    busy?.id === vehicle.id && busy.action === action;

  return (
    <AppWrapper id="garage-app">
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <header className="flex items-end justify-between px-4 pb-3 pt-2">
          <h1 className="text-3xl font-bold">Garage</h1>
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => {
              setVehicles(null);
              load();
            }}
            className="rounded-full p-2 text-orange-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
          {vehicles === null && <LoadingSpinner />}
          {vehicles?.length === 0 && (
            <p className="py-12 text-center text-neutral-500">You don't own any vehicles yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {vehicles?.map((vehicle) => (
              <div key={vehicle.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                    <CategoryIcon category={vehicle.category} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{vehicle.name}</p>
                    <p className="truncate text-xs text-neutral-500">{locationText(vehicle)}</p>
                  </div>
                  <span className="shrink-0 rounded-md border border-neutral-300 px-2 py-0.5 font-mono text-xs dark:border-neutral-600">
                    {vehicle.plate}
                  </span>
                </div>

                <div className="mt-3 flex gap-3">
                  <StatBar label="Fuel" value={vehicle.fuel} />
                  <StatBar label="Engine" value={vehicle.engine} />
                  <StatBar label="Body" value={vehicle.body} />
                </div>

                {vehicle.spawned && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLock(vehicle)}
                      disabled={busy !== null}
                      className={SECONDARY_BUTTON}
                    >
                      {vehicle.locked ? <Unlock size={16} /> : <Lock size={16} />}
                      {isBusy(vehicle, 'lock') ? '…' : vehicle.locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => summon(vehicle)}
                      disabled={busy !== null}
                      className={SECONDARY_BUTTON}
                    >
                      <Navigation size={16} />
                      {isBusy(vehicle, 'summon') ? 'Calling…' : 'Summon'}
                    </button>
                    <button type="button" onClick={() => locate(vehicle)} className={SECONDARY_BUTTON}>
                      <MapPin size={16} /> Find
                    </button>
                  </div>
                )}

                {vehicle.state === 'garaged' && !vehicle.spawned && (
                  <button
                    type="button"
                    onClick={() => valet(vehicle)}
                    disabled={busy !== null}
                    className="mt-3 w-full rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isBusy(vehicle, 'valet') ? 'Calling…' : `Valet · $${GARAGE_VALET_PRICE}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppWrapper>
  );
};
