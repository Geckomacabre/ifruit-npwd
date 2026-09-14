import React, { useEffect, useState } from 'react';
import { Droplets, Hourglass, Thermometer, Wind } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { WeatherData, WeatherEvents } from '@typings/weather';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { BrowserWeather, feelsLikeText, formatChange, formatHour, lookFor } from './utils/conditions';

const REFRESH_MS = 30000;

const CARD = 'rounded-2xl bg-white/15 p-4 backdrop-blur-md';
const CARD_TITLE = 'mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/70';

export const WeatherApp: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      fetchNui<WeatherData>(WeatherEvents.FETCH, undefined, BrowserWeather)
        .then((data) => {
          if (!cancelled) setWeather(data);
        })
        .catch(console.error);

    load();
    const interval = window.setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (!weather) {
    return (
      <AppWrapper id="weather-app" fullBleed>
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  const look = lookFor(weather.condition);
  const [from, to] = weather.isNight ? look.nightGradient : look.dayGradient;

  return (
    <AppWrapper id="weather-app" fullBleed>
      <div
        className="flex flex-1 flex-col overflow-y-auto px-4 pb-10 pt-16 text-white"
        style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
      >
        <div className="flex flex-col items-center text-center drop-shadow">
          <p className="text-3xl">{weather.city}</p>
          <p className="text-8xl font-thin leading-none">{weather.temperature}°</p>
          <p className="text-lg">{look.label}</p>
          <p className="text-lg">
            H:{weather.high}° L:{weather.low}°
          </p>
        </div>

        <section className={`${CARD} mt-8`}>
          <p className={CARD_TITLE}>
            <Hourglass size={14} /> Hourly forecast
          </p>
          <div className="flex justify-between gap-2 overflow-x-auto border-t border-white/20 pt-3">
            {weather.hourly.map((hour, index) => {
              const Icon = hour.isNight ? look.night : look.day;
              return (
                <div key={hour.hour} className="flex min-w-[3rem] flex-col items-center gap-2">
                  <span className="text-sm">{index === 0 ? 'Now' : formatHour(hour.hour)}</span>
                  <Icon size={24} />
                  <span className="text-lg">{hour.temperature}°</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <section className={CARD}>
            <p className={CARD_TITLE}>
              <Wind size={14} /> Wind
            </p>
            <p className="text-3xl">
              {weather.windMph}
              <span className="ml-1 text-base">mph</span>
            </p>
            <p className="text-sm text-white/80">From the {weather.windDirection}</p>
          </section>

          <section className={CARD}>
            <p className={CARD_TITLE}>
              <Thermometer size={14} /> Feels like
            </p>
            <p className="text-3xl">{weather.feelsLike}°</p>
            <p className="text-sm text-white/80">{feelsLikeText(weather)}</p>
          </section>

          <section className={CARD}>
            <p className={CARD_TITLE}>
              <Droplets size={14} /> Precipitation
            </p>
            <p className="text-3xl">{Math.round(weather.rainLevel * 100)}%</p>
            <p className="text-sm text-white/80">{weather.rainLevel > 0 ? 'Falling right now.' : 'None right now.'}</p>
          </section>

          <section className={CARD}>
            <p className={CARD_TITLE}>
              <Hourglass size={14} /> Outlook
            </p>
            <p className="text-sm text-white/90">{formatChange(weather.nextChangeMinutes)}</p>
          </section>
        </div>
      </div>
    </AppWrapper>
  );
};
