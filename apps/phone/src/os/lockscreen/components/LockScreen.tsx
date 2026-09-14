import React, { useRef, useState } from 'react';
import { useWallpaper } from '../../../apps/settings/hooks/useWallpaper';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';
import { useUnreadNotificationIds } from '@os/new-notifications/state';
import { NotificationCard } from '@os/control-center/components/NotificationCard';
import { LockClock, LockControls, LockWidgets } from './LockFace';

// iFruit lock screen: tinted clock over the wallpaper, unread notifications
// stacked beneath it, widgets and the flashlight/camera controls pinned to the
// bottom. Drag anywhere upward to unlock.
export const LockScreen: React.FC = () => {
  const wallpaper = useWallpaper();
  const { unlock } = useLockScreen();
  const unreadIds = useUnreadNotificationIds();

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  // Mirrors dragY so endDrag sees the latest distance: a quick flick fires
  // mouseup before React re-renders, and the dragY in that closure is still 0.
  const dragYRef = useRef(0);

  const startDrag = (clientY: number) => {
    setDragging(true);
    startYRef.current = clientY;
  };

  const moveDrag = (clientY: number) => {
    if (!dragging) return;
    const delta = startYRef.current - clientY;
    dragYRef.current = Math.max(0, Math.min(delta, 220));
    setDragY(dragYRef.current);
  };

  const endDrag = () => {
    setDragging(false);
    if (dragYRef.current > 90) {
      unlock();
    } else {
      dragYRef.current = 0;
      setDragY(0);
    }
  };

  return (
    <div
      className="LockScreen absolute inset-0 z-50 flex flex-col text-white"
      style={{
        backgroundImage: wallpaper,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onMouseDown={(e) => startDrag(e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientY)}
      onMouseUp={endDrag}
      onMouseLeave={() => dragging && endDrag()}
      onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
      onTouchEnd={endDrag}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{
          transform: `translateY(-${dragY}px)`,
          transition: dragging ? 'none' : 'transform 200ms',
        }}
      >
        <div className="mt-12">
          <LockClock />
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4">
          {unreadIds.map((id) => (
            <NotificationCard key={id} id={id} onActivate={unlock} />
          ))}
        </div>
      </div>

      <div className="pb-6">
        <LockWidgets />
        <div className="mt-4">
          <LockControls />
        </div>
      </div>
    </div>
  );
};
