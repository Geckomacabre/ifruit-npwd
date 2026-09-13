import React, { useMemo, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import usePhoneTime from '@os/phone/hooks/usePhoneTime';
import { useWallpaper } from '../../../apps/settings/hooks/useWallpaper';
import { useLockScreen } from '@os/phone/hooks/useLockScreen';

// iFruit-style lock screen: big clock + date over the wallpaper, swipe (or
// tap/drag, for simplicity) the arrow up to unlock. Sits above everything
// else in the phone shell while locked, and is torn down entirely once
// unlocked so it doesn't intercept input for the rest of the session.
export const LockScreen: React.FC = () => {
  const time = usePhoneTime();
  const wallpaper = useWallpaper();
  const { unlock } = useLockScreen();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  const date = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const startDrag = (clientY: number) => {
    setDragging(true);
    startYRef.current = clientY;
  };

  const moveDrag = (clientY: number) => {
    if (!dragging) return;
    const delta = startYRef.current - clientY;
    setDragY(Math.max(0, Math.min(delta, 220)));
  };

  const endDrag = () => {
    setDragging(false);
    if (dragY > 90) {
      unlock();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className="LockScreen absolute inset-0 z-50 flex flex-col items-center text-white"
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
      <div className="mt-16 flex flex-col items-center drop-shadow-lg">
        <span className="text-7xl tracking-tight" style={{ fontFamily: 'GTAArtDeco, sans-serif' }}>
          {time || '--:--'}
        </span>
        <span className="text-lg mt-1 opacity-90">{date}</span>
      </div>

      <div className="flex-1" />

      <div
        className="mb-6 flex flex-col items-center gap-1"
        style={{ transform: `translateY(-${dragY}px)`, transition: dragging ? 'none' : 'transform 200ms' }}
      >
        <ChevronUp className="h-6 w-6 animate-bounce opacity-90" />
        <span className="text-sm opacity-90">Swipe up to unlock</span>
      </div>
    </div>
  );
};
