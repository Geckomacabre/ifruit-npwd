export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'thunder'
  | 'snow'
  | 'windy'
  | 'storm';

export interface WeatherHour {
  hour: number;
  temperature: number;
  isNight: boolean;
}

export interface WeatherData {
  city: string;
  weatherType: string;
  condition: WeatherCondition;
  isNight: boolean;
  /** In-game clock, so the sky can track the server's day/night cycle. */
  hour: number;
  minute: number;
  temperature: number;
  feelsLike: number;
  high: number;
  low: number;
  windMph: number;
  windDirection: string;
  rainLevel: number;
  /** Real minutes until the weather sync moves to its next weather, if known. */
  nextChangeMinutes: number | null;
  hourly: WeatherHour[];
}

export enum WeatherEvents {
  FETCH = 'npwd:weather:fetch',
}
