import React, { useMemo, useState } from 'react';
import { AppWrapper } from '@ui/components';
import { AppIcon } from '@ui/components/AppIcon';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';
import { Link } from 'react-router-dom';
import { useDragOpen } from '@os/control-center/useDragOpen';
import { useControlCenterOpen, useControlCenterMode } from '@os/control-center/state';
import { cn } from '@utils/css';

// iFruit-style dock: a handful of pinned apps in a frosted bar at the
// bottom of the home screen, same spot every time regardless of which page
// the rest of the grid is on.
const DOCK_APP_IDS = ['DIALER', 'MESSAGES', 'BROWSER', 'CONTACTS'];

// A phone home screen pages sideways; it never scrolls vertically. Four
// columns by six rows is what fits this screen without the labels colliding.
const COLS = 4;
const ROWS = 6;
const PER_PAGE = COLS * ROWS;

export const HomeApp: React.FC = () => {
  const { apps, getApp } = useApps();
  const externalApps = useExternalApps();
  const [page, setPage] = useState(0);

  const dockApps = DOCK_APP_IDS.map((id) => getApp(id)).filter(Boolean);

  // Paging is computed on what is actually visible: an app removed in the App
  // Store must close the gap rather than leave a hole and shift every page.
  const pages = useMemo(() => {
    const dockIds = new Set(dockApps.map((app) => app.id));
    const gridApps = [...apps, ...externalApps].filter(
      (app) => !dockIds.has(app.id) && !app.isDisabled,
    );

    const chunks = [];
    for (let i = 0; i < gridApps.length; i += PER_PAGE) {
      chunks.push(gridApps.slice(i, i + PER_PAGE));
    }
    return chunks.length ? chunks : [[]];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps, externalApps]);

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

  // Which page is showing, read back from the scroll position so the dots
  // follow a swipe as well as a dot tap.
  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== page) setPage(next);
  };

  return (
    <AppWrapper fullBleed {...dragNotifications}>
      <div className="home-pages flex flex-1 snap-x snap-mandatory overflow-x-auto" onScroll={onScroll}>
        {pages.map((pageApps, index) => (
          <div
            key={index}
            className="home-page grid w-full shrink-0 snap-center content-start gap-y-5 px-4 pt-14"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {pageApps.map((app) => (
              <Link to={app.path} key={app.id} className="flex justify-center">
                <AppIcon {...app} />
              </Link>
            ))}
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="absolute inset-x-0 bottom-[104px] flex justify-center gap-1.5">
          {pages.map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                index === page ? 'bg-white' : 'bg-white/40',
              )}
            />
          ))}
        </div>
      )}

      {dockApps.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="liquid-glass flex items-center justify-around rounded-[30px] py-2 px-2">
            {/* `flex` on the link, not just the icon: an inline-level child
                sits on the text baseline, and the descender space under it
                was pushing every dock icon ~7px above centre. */}
            {dockApps.map((app) => (
              <Link to={app.path} key={app.id} className="flex">
                <AppIcon {...app} hideLabel />
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppWrapper>
  );
};
