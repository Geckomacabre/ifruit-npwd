import React from 'react';
import { StreetKingsProfile } from '@typings/streetkings';
import { money, round } from '../utils';

interface CareerPanelProps {
  profile: StreetKingsProfile;
  charName: string;
}

interface Stat {
  label: string;
  value: string;
}

export const CareerPanel: React.FC<CareerPanelProps> = ({ profile, charName }) => {
  const { stats } = profile;

  const span = Math.max(1, profile.nextLevelXp - profile.levelStartXp);
  const into = Math.min(span, Math.max(0, profile.xp - profile.levelStartXp));
  const progress = (into / span) * 100;

  const wins = stats.racesWon ?? 0;
  const finished = stats.racesCompleted ?? 0;
  const winRate = finished > 0 ? Math.round((wins / finished) * 100) : 0;

  const cards: Stat[] = [
    { label: 'Races won', value: `${wins}` },
    { label: 'Win rate', value: `${winRate}%` },
    { label: 'Best streak', value: `${stats.bestWinStreak ?? 0}` },
    { label: 'Par times beaten', value: `${stats.goalTimesBeaten ?? 0}` },
    { label: 'Top speed', value: `${round(stats.topSpeedMph, 1)} mph` },
    { label: 'Miles driven', value: round(stats.totalMilesDriven, 0) },
    { label: 'Challenges won', value: `${stats.npcChallengesWon ?? 0}` },
    { label: 'Best drift', value: round(stats.bestDriftScore) },
    { label: 'Cops escaped', value: `${stats.policeEscapes ?? 0}` },
    { label: 'Prize money', value: money(stats.totalCashEarned) },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-10">
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-700 p-4 text-white">
        <p className="text-xs uppercase tracking-widest text-white/50">Driver</p>
        <p className="truncate text-2xl font-bold">{charName}</p>

        <div className="mt-4 flex items-end justify-between text-sm">
          <span className="font-semibold">Level {profile.level}</span>
          <span className="text-white/60">
            {round(into)} / {round(span)} XP
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-amber-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
            <p className="truncate text-xl font-bold">{card.value}</p>
            <p className="truncate text-xs text-neutral-500">{card.label}</p>
          </div>
        ))}
      </div>

      {finished === 0 && (
        <p className="text-center text-sm text-neutral-500">
          No races on record yet. Find a start line and put a time down.
        </p>
      )}
    </div>
  );
};
