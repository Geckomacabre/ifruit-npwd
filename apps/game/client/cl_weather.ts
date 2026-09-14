import { WeatherCondition, WeatherData, WeatherEvents, WeatherHour } from '@typings/weather';
import { RegisterNuiCB } from './cl_utils';

const HOURLY_COUNT = 6;

// GetNameOfZone returns a zone code; these are its documented display names.
// Kept here rather than relying on GetLabelText alone because a handful of
// codes have no label entry and would come back as "NULL".
const ZONE_NAMES: Record<string, string> = {
  AIRP: 'LS International Airport', ALAMO: 'Alamo Sea', ALTA: 'Alta',
  ARMYB: 'Fort Zancudo', BANHAMC: 'Banham Canyon Dr', BANNING: 'Banning',
  BEACH: 'Vespucci Beach', BHAMCA: 'Banham Canyon', BRADP: 'Braddock Pass',
  BRADT: 'Braddock Tunnel', BURTON: 'Burton', CALAFB: 'Calafia Bridge',
  CANNY: 'Raton Canyon', CCREAK: 'Cassidy Creek', CHAMH: 'Chamberlain Hills',
  CHIL: 'Vinewood Hills', CHU: 'Chumash', CMSW: 'Chiliad Mountain',
  CYPRE: 'Cypress Flats', DAVIS: 'Davis', DELBE: 'Del Perro Beach',
  DELPE: 'Del Perro', DELSOL: 'La Puerta', DESRT: 'Grand Senora Desert',
  DOWNT: 'Downtown', DTVINE: 'Downtown Vinewood', EAST_V: 'East Vinewood',
  EBURO: 'El Burro Heights', ELGORL: 'El Gordo Lighthouse', ELYSIAN: 'Elysian Island',
  GALFISH: 'Galilee', GOLF: 'GWC and Golfing Society', GRAPES: 'Grapeseed',
  GREATC: 'Great Chaparral', HARMO: 'Harmony', HAWICK: 'Hawick',
  HORS: 'Vinewood Racetrack', HUMLAB: 'Humane Labs', JAIL: 'Bolingbroke Penitentiary',
  KOREAT: 'Little Seoul', LACT: 'Land Act Reservoir', LAGO: 'Lago Zancudo',
  LDAM: 'Land Act Dam', LEGSQU: 'Legion Square', LMESA: 'La Mesa',
  LOSPUER: 'La Puerta', MIRR: 'Mirror Park', MORN: 'Morningwood',
  MOVIE: 'Richards Majestic', MTCHIL: 'Mount Chiliad', MTGORDO: 'Mount Gordo',
  MTJOSE: 'Mount Josiah', MURRI: 'Murrieta Heights', NCHU: 'North Chumash',
  NOOSE: 'N.O.O.S.E', OCEANA: 'Pacific Ocean', PALCOV: 'Paleto Cove',
  PALETO: 'Paleto Bay', PALFOR: 'Paleto Forest', PALHIGH: 'Palomino Highlands',
  PALMPOW: 'Palmer-Taylor Power Station', PBLUFF: 'Pacific Bluffs', PBOX: 'Pillbox Hill',
  PROCOB: 'Procopio Beach', PROL: 'North Yankton', RANCHO: 'Rancho',
  RGLEN: 'Richman Glen', RICHM: 'Richman', ROCKF: 'Rockford Hills',
  RTRAK: 'Redwood Lights Track', SANAND: 'San Andreas', SANCHIA: 'San Chianski Range',
  SANDY: 'Sandy Shores', SKID: 'Mission Row', SLAB: 'Stab City',
  STAD: 'Maze Bank Arena', STRAW: 'Strawberry', TATAMO: 'Tataviam Mountains',
  TERMINA: 'Terminal', TEXTI: 'Textile City', TONGVAH: 'Tongva Hills',
  TONGVAV: 'Tongva Valley', VCANA: 'Vespucci Canals', VESP: 'Vespucci',
  VINE: 'Vinewood', WINDF: 'Ron Alternates Wind Farm', WVINE: 'West Vinewood',
  ZANCUDO: 'Zancudo River', ZP_ORT: 'Port of South LS', ZQ_UAR: 'Davis Quartz',
  ISHeist: 'Cayo Perico',
};

const currentCity = (): string => {
  const [x, y, z] = GetEntityCoords(PlayerPedId(), false) as unknown as number[];
  const zone = GetNameOfZone(x, y, z);
  if (ZONE_NAMES[zone]) return ZONE_NAMES[zone];

  const label = GetLabelText(zone);
  return label && label !== 'NULL' ? label : 'Los Santos';
};

// GTA weather type -> what the app shows, with the °F range a day in that
// weather sits in (lb-phone's Weather table, so nothing changes for players).
const WEATHER_TYPES: Record<string, { condition: WeatherCondition; low: number; high: number }> = {
  BLIZZARD: { condition: 'snow', low: -15, high: 10 },
  CLEAR: { condition: 'clear', low: 80, high: 95 },
  CLEARING: { condition: 'cloudy', low: 75, high: 85 },
  CLOUDS: { condition: 'cloudy', low: 80, high: 90 },
  EXTRASUNNY: { condition: 'clear', low: 90, high: 110 },
  FOGGY: { condition: 'fog', low: 80, high: 90 },
  HALLOWEEN: { condition: 'storm', low: 50, high: 60 },
  NEUTRAL: { condition: 'partly-cloudy', low: 80, high: 95 },
  OVERCAST: { condition: 'partly-cloudy', low: 80, high: 85 },
  RAIN: { condition: 'rain', low: 75, high: 90 },
  SMOG: { condition: 'fog', low: 90, high: 95 },
  SNOW: { condition: 'snow', low: 0, high: 32 },
  SNOWLIGHT: { condition: 'snow', low: 0, high: 32 },
  THUNDER: { condition: 'thunder', low: 75, high: 90 },
  XMAS: { condition: 'snow', low: -5, high: 15 },
};

const typeByHash = new Map(
  Object.keys(WEATHER_TYPES).map((name) => [GetHashKey(name) >>> 0, name] as [number, string]),
);

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const isNightHour = (hour: number) => hour >= 21 || hour <= 5;

// A smooth day curve (coolest ~5am, warmest ~3pm) instead of lb-phone's random
// roll, so the number does not jump every time the app is opened.
const temperatureAt = (low: number, high: number, hour: number) =>
  Math.round(low + (high - low) * ((Math.cos(((hour - 15) / 24) * 2 * Math.PI) + 1) / 2));

const buildWeather = (): WeatherData => {
  const [currentHash] = GetWeatherTypeTransition() as unknown as number[];
  const weatherType = typeByHash.get(currentHash >>> 0) ?? 'CLEAR';
  const { condition: baseCondition, low, high } = WEATHER_TYPES[weatherType];

  const hour = GetClockHours();
  const rainLevel = GetRainLevel();
  const windMph = GetWindSpeed() * 2.236936;
  const [windX, windY] = GetWindDirection() as unknown as number[];

  let condition = baseCondition;
  if (rainLevel > 0.6) condition = 'heavy-rain';
  else if (rainLevel > 0.3) condition = 'rain';
  else if (rainLevel > 0) condition = 'drizzle';

  const wet = condition === 'snow' || condition.includes('rain') || condition === 'drizzle';
  if (!wet && condition !== 'thunder' && windMph > 22) condition = 'windy';

  const temperature = temperatureAt(low, high, hour);

  // Wind chill (weather.gov formula), only meaningful when it is cold and windy.
  let feelsLike = temperature;
  if (temperature < 50 && windMph > 3) {
    const chill = 35.74 + 0.6215 * temperature - 35.75 * windMph ** 0.16 + 0.4275 * temperature * windMph ** 0.16;
    feelsLike = Math.min(Math.floor(chill), temperature);
  }

  const windAngle = (Math.atan2(windX, windY) * 180) / Math.PI + 180;
  const windDirection = COMPASS[Math.round(windAngle / 45) % 8];

  const hourly: WeatherHour[] = Array.from({ length: HOURLY_COUNT }, (_, index) => {
    const forecastHour = (hour + index) % 24;
    return {
      hour: forecastHour,
      temperature: temperatureAt(low, high, forecastHour),
      isNight: isNightHour(forecastHour),
    };
  });

  // Renewed-Weathersync publishes the running weather with its minutes left.
  const synced = (global as any).GlobalState?.weather;
  const nextChangeMinutes = typeof synced?.time === 'number' && synced.time < 100000 ? synced.time : null;

  return {
    city: currentCity(),
    hour,
    minute: GetClockMinutes(),
    weatherType,
    condition,
    isNight: isNightHour(hour),
    temperature,
    feelsLike,
    high,
    low,
    windMph: Math.round(windMph),
    windDirection,
    rainLevel,
    nextChangeMinutes,
    hourly,
  };
};

RegisterNuiCB(WeatherEvents.FETCH, (_data, cb) => {
  cb(buildWeather());
});
