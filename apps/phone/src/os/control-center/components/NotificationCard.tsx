import React from 'react';
import { useRecoilValue } from 'recoil';
import { notifications } from '@os/new-notifications/state';
import { useNotification } from '@os/new-notifications/useNotification';
import { useApp } from '@os/apps/hooks/useApps';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useControlCenterOpen } from '../state';

// A single notification, rendered as a rounded pill card in the Notification
// Center list (as opposed to the toast banner shown when it first arrives).
interface NotificationCardProps {
  id: string;
  /** Runs before navigating -- the lock screen uses it to unlock first. */
  onActivate?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ id, onActivate }) => {
  const { appId, content, secondaryTitle, path } = useRecoilValue(notifications(id));
  const app = useApp(appId);
  const { markAsRead } = useNotification();
  const history = useHistory();
  const [, setOpen] = useControlCenterOpen();
  const [t] = useTranslation();

  const handleClick = () => {
    markAsRead(id);
    setOpen(false);
    onActivate?.();
    if (path) history.push(path);
  };

  if (!app) return null;

  return (
    <button
      onClick={handleClick}
      className="liquid-glass liquid-glass-dark flex items-start gap-2.5 rounded-[18px] px-3 py-3 text-left transition hover:brightness-110"
    >
      {/* The app's real home-screen artwork when the icon set has it, so a
          notification looks like it came from the icon you tapped. */}
      {app.Icon ? (
        <app.Icon className="h-[38px] w-[38px] shrink-0 rounded-[9px]" />
      ) : (
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: app.backgroundColor }}
        >
          {app.NotificationIcon && <app.NotificationIcon fontSize="small" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-white">{t(app.nameLocale)}</span>
          {secondaryTitle && (
            <span className="shrink-0 text-[13px] text-white/60">{secondaryTitle}</span>
          )}
        </div>
        <p className="line-clamp-3 text-[15px] leading-snug text-white/85">{content}</p>
      </div>
    </button>
  );
};
