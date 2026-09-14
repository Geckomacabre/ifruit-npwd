export type GarageVehicleState = 'garaged' | 'out' | 'impounded';

export interface GarageVehicle {
  id: number;
  plate: string;
  name: string;
  category: string;
  state: GarageVehicleState;
  /** Currently exists in the world. */
  spawned: boolean;
  /** Door lock state; only known while the car is spawned. */
  locked: boolean | null;
  garage: string | null;
  depotPrice: number;
  fuel: number;
  engine: number;
  body: number;
}

export interface GarageActionResp {
  ok: boolean;
  error?: string;
  locked?: boolean;
}

export const GARAGE_VALET_PRICE = 100;

// Handled by lua/garage/client.lua.
export enum GarageEvents {
  FETCH_VEHICLES = 'npwd:garage:fetchVehicles',
  LOCATE = 'npwd:garage:locate',
  VALET = 'npwd:garage:valet',
  TOGGLE_LOCK = 'npwd:garage:toggleLock',
  SUMMON = 'npwd:garage:summon',
}
