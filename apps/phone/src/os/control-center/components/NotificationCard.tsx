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
      className="liquid-glass liquid-glass-dark flex items-center gap-3 rounded-2xl hover:brightness-110 transition px-4 py-3 text-left"
    >
      {/* The app's real home-screen artwork when the icon set has it, so a
          notification looks like it came from the icon you tapped. */}
      {app.Icon ? (
        <app.Icon className="h-9 w-9 shrink-0 rounded-[10px]" />
      ) : (
        <div
          className="flex items-center justify-center rounded-full h-9 w-9 shrink-0"
          style={{ backgroundColor: app.backgroundColor }}
        >
          {app.NotificationIcon && <app.NotificationIcon fontSize="small" />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-semibold truncate">{t(app.nameLocale)}</span>
          {secondaryTitle && <span className="text-white/50 text-xs shrink-0 ml-2">{secondaryTitle}</span>}
        </div>
        <p className="text-white/70 text-sm line-clamp-2">{content}</p>
      </div>
    </button>
  );
};
