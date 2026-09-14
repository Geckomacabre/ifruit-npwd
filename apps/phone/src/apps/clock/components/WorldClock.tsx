import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { MinusCircle, Plus } from 'lucide-react';
import { useNow, worldClocksState } from '../hooks/state';
import { cityTime, WORLD_CITIES } from '../utils';

export const WorldClock: React.FC = () => {
  const now = useNow(1000);
  const [cities, setCities] = useRecoilState(worldClocksState);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const available = Object.keys(WORLD_CITIES).filter((city) => !cities.includes(city));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4">
        <button type="button" className="text-orange-500" onClick={() => setEditing((value) => !value)}>
          {editing ? 'Done' : 'Edit'}
        </button>
        <button
          type="button"
          aria-label="Add city"
          className="text-orange-500 disabled:opacity-40"
          disabled={!available.length}
          onClick={() => setAdding(true)}
        >
          <Plus size={24} />
        </button>
      </header>

      <h1 className="px-4 pb-2 text-3xl font-bold">World Clock</h1>

      <div className="flex-1 overflow-y-auto px-4">
        {cities.length === 0 && <p className="py-10 text-center text-neutral-500">No World Clocks</p>}
        {cities.map((city) => {
          const { time, period, diffHours, dayLabel } = cityTime(WORLD_CITIES[city], now);
          const offset = diffHours === 0 ? 'same time' : `${diffHours > 0 ? '+' : ''}${diffHours} hrs`;

          return (
            <div key={city} className="flex items-center gap-3 border-b border-neutral-800 py-3">
              {editing && (
                <button
                  type="button"
                  aria-label={`Remove ${city}`}
                  className="text-red-500"
                  onClick={() => setCities(cities.filter((c) => c !== city))}
                >
                  <MinusCircle size={22} />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-400">
                  {dayLabel}, {offset}
                </p>
                <p className="truncate text-2xl">{city}</p>
              </div>
              <p className="text-5xl font-extralight tabular-nums">
                {time}
                <span className="ml-1 text-xl">{period}</span>
              </p>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="absolute inset-0 z-10 flex flex-col bg-neutral-900">
          <header className="flex items-center justify-between px-4 py-3">
            <h2 className="font-semibold">Choose a City</h2>
            <button type="button" className="text-orange-500" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </header>
          <div className="flex-1 overflow-y-auto">
            {available.map((city) => (
              <button
                type="button"
                key={city}
                className="block w-full border-b border-neutral-800 px-4 py-3 text-left hover:bg-neutral-800"
                onClick={() => {
                  setCities([...cities, city]);
                  setAdding(false);
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
