import { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNotification } from '@os/new-notifications/useNotification';
import { alarmsState, timerState } from './state';
import { formatClockTime } from '../utils';

/**
 * Mounted with the phone itself (Phone.tsx), not the Clock app, so alarms and
 * timers still go off after the app -- or the phone -- is closed.
 */
export const useClockService = () => {
  const alarms = useRecoilValue(alarmsState);
  const [timer, setTimer] = useRecoilState(timerState);
  const { enqueueNotification } = useNotification();
  // "<alarm id>@<minute>" for alarms already rung this minute.
  const rungRef = useRef(new Set<string>());

  useEffect(() => {
    const notify = (secondaryTitle: string, content: string, path: string) =>
      enqueueNotification({
        appId: 'CLOCK',
        content,
        secondaryTitle,
        path,
        notisId: 'npwd:clock',
        keepOpen: false,
        duration: 5000,
        onClick: null,
      });

    const interval = window.setInterval(() => {
      const now = new Date();
      const minuteKey = `${now.toDateString()} ${now.getHours()}:${now.getMinutes()}`;

      for (const alarm of alarms) {
        const key = `${alarm.id}@${minuteKey}`;
        if (!alarm.enabled || alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) continue;
        if (rungRef.current.has(key)) continue;

        rungRef.current = new Set([...rungRef.current].filter((k) => k.endsWith(minuteKey)).concat(key));
        const { time, period } = formatClockTime(alarm.hour, alarm.minute);
        notify(`${time} ${period}`, alarm.label || 'Alarm', '/clock/alarms');
      }

      if (timer.endsAt !== null && Date.now() >= timer.endsAt) {
        setTimer({ endsAt: null, remainingMs: 0 });
        notify('Timer', 'Your timer is done.', '/clock/timer');
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [alarms, timer, setTimer, enqueueNotification]);
};
