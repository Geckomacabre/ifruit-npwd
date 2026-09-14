import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { MinusCircle, Plus } from 'lucide-react';
import { NPWDInput } from '@ui/components/Input';
import { cn } from '@utils/css';
import { Alarm, alarmsState } from '../hooks/state';
import { formatClockTime, pad } from '../utils';

const Toggle: React.FC<{ on: boolean; onClick: () => void }> = ({ on, onClick }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onClick}
    className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-green-500' : 'bg-neutral-700')}
  >
    <span
      className={cn(
        'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
        on ? 'left-[22px]' : 'left-0.5',
      )}
    />
  </button>
);

export const Alarms: React.FC = () => {
  const [alarms, setAlarms] = useRecoilState(alarmsState);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Alarm | null>(null);

  const sorted = [...alarms].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  const isExisting = draft ? alarms.some((alarm) => alarm.id === draft.id) : false;

  const newAlarm = () => {
    const now = new Date();
    setDraft({ id: String(Date.now()), hour: now.getHours(), minute: now.getMinutes(), label: '', enabled: true });
  };

  const save = () => {
    if (!draft) return;
    const saved = { ...draft, enabled: true };
    setAlarms((previous) =>
      isExisting ? previous.map((alarm) => (alarm.id === saved.id ? saved : alarm)) : [...previous, saved],
    );
    setDraft(null);
  };

  const remove = (id: string) => {
    setAlarms((previous) => previous.filter((alarm) => alarm.id !== id));
    if (draft?.id === id) setDraft(null);
  };

  const toggle = (id: string) =>
    setAlarms((previous) => previous.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4">
        <button type="button" className="text-orange-500" onClick={() => setEditing((value) => !value)}>
          {editing ? 'Done' : 'Edit'}
        </button>
        <button type="button" aria-label="Add alarm" className="text-orange-500" onClick={newAlarm}>
          <Plus size={24} />
        </button>
      </header>

      <h1 className="px-4 pb-2 text-3xl font-bold">Alarms</h1>

      <div className="flex-1 overflow-y-auto px-4">
        {sorted.length === 0 && <p className="py-10 text-center text-neutral-500">No Alarms</p>}
        {sorted.map((alarm) => {
          const { time, period } = formatClockTime(alarm.hour, alarm.minute);
          return (
            <div key={alarm.id} className="flex items-center gap-3 border-b border-neutral-800 py-3">
              {editing && (
                <button type="button" aria-label="Delete alarm" className="text-red-500" onClick={() => remove(alarm.id)}>
                  <MinusCircle size={22} />
                </button>
              )}
              <button
                type="button"
                className={cn('min-w-0 flex-1 text-left', !alarm.enabled && 'text-neutral-500')}
                onClick={() => setDraft(alarm)}
              >
                <p className="text-5xl font-extralight tabular-nums">
                  {time}
                  <span className="ml-1 text-xl">{period}</span>
                </p>
                <p className="truncate text-sm">{alarm.label || 'Alarm'}</p>
              </button>
              {!editing && <Toggle on={alarm.enabled} onClick={() => toggle(alarm.id)} />}
            </div>
          );
        })}
      </div>

      {draft && (
        <div className="absolute inset-0 z-10 flex flex-col bg-neutral-900">
          <header className="flex items-center justify-between px-4 py-3">
            <button type="button" className="text-orange-500" onClick={() => setDraft(null)}>
              Cancel
            </button>
            <h2 className="font-semibold">{isExisting ? 'Edit Alarm' : 'Add Alarm'}</h2>
            <button type="button" className="font-semibold text-orange-500" onClick={save}>
              Save
            </button>
          </header>

          <div className="flex flex-col gap-4 px-4 pt-4">
            <NPWDInput
              type="time"
              value={`${pad(draft.hour)}:${pad(draft.minute)}`}
              onChange={(event) => {
                const [hour, minute] = event.target.value.split(':').map(Number);
                if (!Number.isNaN(hour) && !Number.isNaN(minute)) setDraft({ ...draft, hour, minute });
              }}
              className="bg-neutral-800 py-4 text-center text-4xl text-white dark:bg-neutral-800"
            />
            <label className="flex items-center gap-3 rounded-lg bg-neutral-800 px-3">
              <span className="text-neutral-400">Label</span>
              <NPWDInput
                value={draft.label}
                maxLength={40}
                placeholder="Alarm"
                onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                className="bg-transparent text-right text-white dark:bg-transparent"
              />
            </label>
            {isExisting && (
              <button
                type="button"
                className="rounded-lg bg-neutral-800 py-3 text-red-500"
                onClick={() => remove(draft.id)}
              >
                Delete Alarm
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
