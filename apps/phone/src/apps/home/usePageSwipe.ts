import { useCallback, useEffect, useRef } from 'react';

/** Past this many pixels a press is a swipe, not a tap on an app icon. */
const DRAG_THRESHOLD = 8;

// Dragging a horizontally scrolling container with a MOUSE does nothing by
// default -- CSS scroll-snap only gives you the gesture on a touchscreen, and
// in NUI the player has a mouse. So the mouse is wired up by hand here and
// touch is left to the browser, which already handles it natively.
export const usePageSwipe = () => {
  const ref = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);

  const settle = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const page = Math.round(el.scrollLeft / el.clientWidth);
    el.scrollTo({ left: page * el.clientWidth, behavior: 'smooth' });

    // Snapping stays off until that scroll actually lands. Restoring it while
    // the animation is still in flight makes the browser re-snap from wherever
    // the scroll happens to be and yank the page straight back where it came
    // from. scrollend is the real signal; the timeout is for browsers without it.
    const restore = () => {
      el.style.scrollSnapType = '';
      el.removeEventListener('scrollend', restore);
      window.clearTimeout(fallback);
    };
    const fallback = window.setTimeout(restore, 600);
    el.addEventListener('scrollend', restore);
  }, []);

  useEffect(() => {
    if (!ref.current) return undefined;

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!dragging.current || !el) return;

      const delta = e.clientX - startX.current;
      if (!moved.current && Math.abs(delta) > DRAG_THRESHOLD) {
        moved.current = true;
        el.style.scrollSnapType = 'none';
      }
      if (moved.current) el.scrollLeft = startScroll.current - delta;
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (moved.current) settle();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [settle]);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startScroll.current = el.scrollLeft;
  };

  // A drag that ends on top of an app icon must not also launch it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!moved.current) return;
    e.preventDefault();
    e.stopPropagation();
    moved.current = false;
  };

  const goToPage = (page: number) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: page * el.clientWidth, behavior: 'smooth' });
  };

  return { ref, onMouseDown, onClickCapture, goToPage };
};
