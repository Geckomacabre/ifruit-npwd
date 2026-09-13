import { useCallback, useEffect, useRef, useState } from 'react';

// Shared drag-down gesture logic. Listens on `window` for move/up once a
// drag starts, rather than on the originating element -- a plain onMouseMove
// on a small element stops firing the moment the cursor leaves that
// element's bounds (no implicit capture like touch has), which is why a
// drag-down gesture on a short handle silently died after a few pixels.
export const useDragOpen = (thresholdPx: number, onTrigger: () => void) => {
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const triggeredRef = useRef(false);

  const handleMove = useCallback(
    (clientY: number) => {
      if (triggeredRef.current) return;
      if (clientY - startYRef.current > thresholdPx) {
        triggeredRef.current = true;
        onTrigger();
      }
    },
    [thresholdPx, onTrigger],
  );

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const stop = () => setDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, handleMove]);

  const startDrag = (clientY: number) => {
    startYRef.current = clientY;
    triggeredRef.current = false;
    setDragging(true);
  };

  return {
    onMouseDown: (e: React.MouseEvent) => startDrag(e.clientY),
    onTouchStart: (e: React.TouchEvent) => startDrag(e.touches[0].clientY),
  };
};
