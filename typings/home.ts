export interface HomeKeyholder {
  citizenid: string;
  name: string;
}

export interface HomeProperty {
  id: number;
  name: string;
  price: number;
  /** Hours between rent charges, or null when the property is bought outright. */
  rentInterval: number | null;
  /** Owned outright by the viewer, as opposed to just holding a key. */
  owned: boolean;
  x: number | null;
  y: number | null;
  z: number | null;
  keyholders: HomeKeyholder[];
}

export interface HomeLocateDTO {
  x: number;
  y: number;
}

export interface HomeRevokeDTO {
  propertyId: number;
  citizenid: string;
}

export enum HomeEvents {
  FETCH = 'npwd:home:fetch',
  LOCATE = 'npwd:home:locate',
  REVOKE_KEY = 'npwd:home:revokeKey',
}
