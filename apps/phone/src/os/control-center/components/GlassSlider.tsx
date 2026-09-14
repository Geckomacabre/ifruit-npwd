import React, { useCallback, useEffect, useRef, useState } from 'react';

interface GlassSliderProps {
  value: number;
  /** Fires continuously while dragging. Omit for values too expensive to write per frame. */
  onChange?: (value: number) => void;
  /** Fires once when the drag ends. */
  onCommit?: (value: number) => void;
  icon: React.ReactNode;
  label: string;
}

// Tall Control Center slider: a frosted pill that fills white from the bottom,
// with the glyph sitting inside the filled area. Dragging anywhere on the
// track sets the level, the same way the brightness/volume sliders behave.
export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  onChange,
  onCommit,
  icon,
  label,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [local, setLocal] = useState(value);

  // The fill follows the pointer during a drag and the source of truth
  // otherwise, so a slider that only commits on release still animates.
  const shown = dragging ? local : value;
  const localRef = useRef(local);
  localRef.current = local;

  const setFromClientY = useCallback(
    (clientY: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((rect.bottom - clientY) / rect.height) * 100;
      const next = Math.round(Math.max(0, Math.min(100, pct)));
      setLocal(next);
      onChange?.(next);
    },
    [onChange],
  );

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => setFromClientY(e.clientY);
    const onTouchMove = (e: TouchEvent) => setFromClientY(e.touches[0].clientY);
    const onEnd = () => {
      setDragging(false);
      onCommit?.(localRef.current);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging, setFromClientY, onCommit]);

  // stopPropagation so a drag on the slider doesn't also drag the whole
  // Control Center panel closed.
  const start = (clientY: number) => {
    setDragging(true);
    setFromClientY(clientY);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuenow={shown}
      aria-valuemin={0}
      aria-valuemax={100}
      onMouseDown={(e) => {
        e.stopPropagation();
        start(e.clientY);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        start(e.touches[0].clientY);
      }}
      className="liquid-glass relative h-full w-full overflow-hidden rounded-[26px]"
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-white"
        style={{ height: `${shown}%`, transition: dragging ? 'none' : 'height 120ms' }}
      />
      {/* White + difference blending inverts against whatever is behind it, so
          the glyph reads dark on the white fill and light on the empty track. */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center text-white mix-blend-difference">
        {icon}
      </div>
    </div>
  );
};
