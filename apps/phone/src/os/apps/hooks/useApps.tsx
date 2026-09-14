import React, { useCallback, useMemo } from 'react';
import { useNotifications } from '@os/notifications/hooks/useNotifications';
import { createLazyAppIcon } from '../utils/createLazyAppIcon';
import { APPS, IApp } from '../config/apps';
import { SvgIconComponent } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { useSettingsValue } from '../../../apps/settings/hooks/useSettings';
import { IconSetObject } from '@typings/settings';

export const useApps = () => {
  const { icons } = useNotifications();
  const theme = useTheme();
  const settingsValue = useSettingsValue();
  const curIconSet = settingsValue.iconSet.value as IconSetObject;
  const installedApps = settingsValue.installedApps;

  const apps: IApp[] = useMemo(() => {
    return APPS.map((app) => {
      // Undefined installedApps means the player hasn't touched the App Store
      // yet, so every removable app they already had stays visible.
      const isUninstalled =
        app.removable && Array.isArray(installedApps) && !installedApps.includes(app.id);
      const isDisabled = app.disable || isUninstalled;
      const SvgIcon = React.lazy<SvgIconComponent>(() =>
        import(`../icons/${curIconSet.name}/svg/${app.id}.tsx`).catch(
          () => 'Was not able to find a dynamic import for icon from this icon set',
        ),
      );
      const AppIcon = React.lazy<SvgIconComponent>(() =>
        import(`../icons/${curIconSet.name}/app/${app.id}.tsx`).catch(
          () => 'Was not able to find a dynamic import for icon from this icon set',
        ),
      );

      const NotificationIcon = createLazyAppIcon(SvgIcon);
      const Icon = createLazyAppIcon(AppIcon);

      if (curIconSet.custom) {
        return {
          ...app,
          notification: icons.find((i) => i.key === app.id),
          NotificationIcon,
          Icon,
          notificationIcon: (
            <NotificationIcon htmlColor={theme.palette.text.primary} fontSize="small" />
          ),
          icon: <Icon />,
          isDisabled,
        };
      }

      return {
        ...app,
        notification: icons.find((i) => i.key === app.id),
        NotificationIcon,
        notificationIcon: <NotificationIcon htmlColor={app.color} fontSize="small" />,
        isDisabled,
      };
    });
  }, [icons, curIconSet, theme, installedApps]);

  const allApps = useMemo(() => [...apps], [apps]);
  const getApp = useCallback(
    (id: string): IApp => {
      return allApps.find((a) => a.id === id) || null;
    },
    [allApps],
  );

  //const filteredApps = apps.filter((app) => !ResourceConfig?.disabledApps.includes(app.id));
  return { apps, getApp };
};

export const useApp = (id: string): IApp => {
  const { getApp } = useApps();
  return getApp(id);
};
