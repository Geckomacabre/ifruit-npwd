import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { AlarmClock, Globe, Hourglass, Timer } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { cn } from '@utils/css';
import { WorldClock } from './components/WorldClock';
import { Alarms } from './components/Alarms';
import { Stopwatch } from './components/Stopwatch';
import { TimerView } from './components/TimerView';

const TABS = [
  { path: '/clock', label: 'World Clock', Icon: Globe, exact: true },
  { path: '/clock/alarms', label: 'Alarms', Icon: AlarmClock, exact: false },
  { path: '/clock/stopwatch', label: 'Stopwatch', Icon: Timer, exact: false },
  { path: '/clock/timer', label: 'Timers', Icon: Hourglass, exact: false },
];

export const ClockApp: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <AppWrapper id="clock-app" fullBleed>
      <div className="relative flex flex-1 flex-col overflow-hidden bg-black pt-12 text-white">
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Switch>
            <Route path="/clock/alarms" component={Alarms} />
            <Route path="/clock/stopwatch" component={Stopwatch} />
            <Route path="/clock/timer" component={TimerView} />
            <Route path="/clock" component={WorldClock} />
          </Switch>
        </div>

        <nav className="liquid-glass liquid-glass-dark liquid-glass-bar flex pb-6 pt-2">
          {TABS.map(({ path, label, Icon, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path);
            return (
              <button
                type="button"
                key={path}
                onClick={() => history.push(path)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 text-[11px]',
                  active ? 'text-orange-500' : 'text-neutral-500',
                )}
              >
                <Icon size={22} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </AppWrapper>
  );
};
