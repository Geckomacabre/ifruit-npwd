import React from 'react';
import { AppWrapper } from '@ui/components';
import { Box } from '@mui/material';
import { GridMenu } from '@ui/components/GridMenu';
import { AppIcon } from '@ui/components/AppIcon';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';
import { Link } from 'react-router-dom';
import { useDragOpen } from '@os/control-center/useDragOpen';
import { useControlCenterOpen, useControlCenterMode } from '@os/control-center/state';

// iFruit-style dock: a handful of pinned apps in a frosted bar at the
// bottom of the home screen, same spot every time regardless of where the
// rest of the grid scrolls to.
const DOCK_APP_IDS = ['DIALER', 'MESSAGES', 'BROWSER', 'CONTACTS'];

export const HomeApp: React.FC = () => {
  const { apps, getApp } = useApps();
  const externalApps = useExternalApps();

  const dockApps = DOCK_APP_IDS.map((id) => getApp(id)).filter(Boolean);
  const dockIds = new Set(dockApps.map((app) => app.id));
  const gridApps = [...apps, ...externalApps].filter((app) => !dockIds.has(app.id));

  // Dragging down anywhere on the home screen (not just the status bar)
  // opens Notifications only, no quick-settings grid. Wired onto this
  // existing wrapper rather than an overlay div, so it never blocks taps on
  // the app icons underneath -- only an actual drag (past the threshold)
  // does anything; a normal tap reaches the icon's own onClick untouched.
  const [, setControlCenterOpen] = useControlCenterOpen();
  const [, setControlCenterMode] = useControlCenterMode();
  const dragNotifications = useDragOpen(60, () => {
    setControlCenterMode('notifications');
    setControlCenterOpen(true);
  });

  return (
    <AppWrapper fullBleed {...dragNotifications}>
      <Box component="div" mt={7} px={3} className="flex-1 overflow-y-auto pb-28">
        {gridApps.length > 0 && <GridMenu xs={3} items={gridApps} />}
      </Box>

      {dockApps.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="liquid-glass flex items-center justify-around rounded-[30px] py-2 px-2">
            {dockApps.map((app) => (
              <Link to={app.path} key={app.id}>
                <AppIcon {...app} hideLabel />
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppWrapper>
  );
};
