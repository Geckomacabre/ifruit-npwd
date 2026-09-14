export interface FitbitStatus {
  food: number;
  thirst: number;
}

export interface FitbitThresholds {
  /** Alert below this percentage. 0 disables the alert. */
  food: number;
  thirst: number;
  /** Minutes between repeat alerts. 0 falls back to the two-minute default. */
  interval: number;
}

export interface FitbitState {
  status: FitbitStatus;
  thresholds: FitbitThresholds;
}

export interface FitbitSetResult {
  ok: boolean;
  thresholds: FitbitThresholds;
}

export enum FitbitEvents {
  FETCH = 'npwd:fitbit:fetch',
  SET_ALERT = 'npwd:fitbit:setAlert',
}
