import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { GTA_MAP, imageToWorld, worldToImage } from './projection';
import './gtaMap.css';

export interface GtaMapMarker {
  x: number;
  y: number;
  /** Drives the pin's colour; see the palette below. */
  kind?: 'destination' | 'player' | 'driver';
  label?: string;
}

interface GtaMapProps {
  markers?: GtaMapMarker[];
  /** Omit to make the map read-only — no pin drops on tap. */
  onPick?: (world: { x: number; y: number }) => void;
  /** World position to centre on the first time the map is shown. */
  center?: { x: number; y: number };
  /** Keeps the view following a moving marker (the live drive HUD). */
  follow?: { x: number; y: number };
  className?: string;
}

const PIN_COLOR: Record<string, string> = {
  destination: '#14b8a6',
  player: '#0a84ff',
  driver: '#ffd60a',
};

// Screen pixels per image pixel. The image is ~6000x9000, so even "zoomed in"
// is a small number; the floor is roughly the whole island in a phone screen.
const MIN_ZOOM = 0.035;
const MAX_ZOOM = 0.45;
const DEFAULT_ZOOM = 0.09;

/** Past this many pixels a pointer gesture is a pan, not a tap. */
const TAP_SLOP = 6;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export const GtaMap: React.FC<GtaMapProps> = ({
  markers = [],
  onPick,
  center,
  follow,
  className,
}) => {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [failed, setFailed] = useState(false);

  // The transform is computed from the viewport's size, so the first paint has
  // to wait for a measurement -- reading clientWidth during render would give
  // 0 and never correct itself.
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const box = viewport.current;
    if (!box) return;

    const measure = () => setSize({ width: box.clientWidth, height: box.clientHeight });
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Centre of the view, in image pixels.
  const [view, setView] = useState(() =>
    center
      ? worldToImage(center.x, center.y)
      : { x: GTA_MAP.pixelWidth / 2, y: GTA_MAP.pixelHeight / 2 },
  );

  // Live gesture state. A ref rather than state: it changes on every pointer
  // move and none of it needs to trigger a render on its own.
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    from: { x: number; y: number };
    moved: boolean;
  } | null>(null);

  const clampView = useCallback((next: { x: number; y: number }, atZoom: number) => {
    const box = viewport.current;
    if (!box) return next;

    // Keep at least the viewport's worth of map on screen, unless the whole
    // map is smaller than the viewport at this zoom, in which case centre it.
    const halfW = box.clientWidth / 2 / atZoom;
    const halfH = box.clientHeight / 2 / atZoom;

    return {
      x:
        halfW * 2 >= GTA_MAP.pixelWidth
          ? GTA_MAP.pixelWidth / 2
          : clamp(next.x, halfW, GTA_MAP.pixelWidth - halfW),
      y:
        halfH * 2 >= GTA_MAP.pixelHeight
          ? GTA_MAP.pixelHeight / 2
          : clamp(next.y, halfH, GTA_MAP.pixelHeight - halfH),
    };
  }, []);

  // `follow` moves the view with a live marker; `center` usually arrives after
  // mount (the caller has to ask the game where the player is), so it recentres
  // when it lands rather than only seeding the initial view.
  useEffect(() => {
    if (follow) setView(clampView(worldToImage(follow.x, follow.y), zoom));
  }, [follow?.x, follow?.y, clampView, zoom]);

  useEffect(() => {
    if (center) setView(clampView(worldToImage(center.x, center.y), zoom));
  }, [center?.x, center?.y, clampView, zoom]);

  const changeZoom = (factor: number) => {
    setZoom((current) => {
      const next = clamp(current * factor, MIN_ZOOM, MAX_ZOOM);
      setView((v) => clampView(v, next));
      return next;
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: view,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < TAP_SLOP) return;

    state.moved = true;
    setView(clampView({ x: state.from.x - dx / zoom, y: state.from.y - dy / zoom }, zoom));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state || state.moved || !onPick) return;

    // A tap: turn where it landed into a world position.
    const box = viewport.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const pixelX = view.x + (event.clientX - rect.left - box.clientWidth / 2) / zoom;
    const pixelY = view.y + (event.clientY - rect.top - box.clientHeight / 2) / zoom;
    onPick(imageToWorld(pixelX, pixelY));
  };

  const offsetX = size.width / 2 - view.x * zoom;
  const offsetY = size.height / 2 - view.y * zoom;

  return (
    <div ref={viewport} className={`gta-map ${className ?? ''}`}>
      {failed ? (
        <p className="gta-map-error">Map image missing — expected {GTA_MAP.image}.</p>
      ) : (
        <>
          <div
            className="gta-map-layer"
            style={{
              width: GTA_MAP.pixelWidth,
              height: GTA_MAP.pixelHeight,
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <img
              src={GTA_MAP.image}
              alt=""
              draggable={false}
              onError={() => setFailed(true)}
              style={{ width: '100%', height: '100%' }}
            />

            {markers.map((marker, index) => {
              const pixel = worldToImage(marker.x, marker.y);
              return (
                <span
                  key={`${marker.kind}-${index}`}
                  className="gta-map-pin"
                  style={{
                    left: pixel.x,
                    top: pixel.y,
                    // Counter-scale, or the pins shrink with the map.
                    transform: `translate(-50%, -100%) scale(${1 / zoom})`,
                    color: PIN_COLOR[marker.kind ?? 'destination'],
                  }}
                >
                  <svg width="26" height="34" viewBox="0 0 26 34">
                    <path
                      d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z"
                      fill="currentColor"
                    />
                    <circle cx="13" cy="13" r="5" fill="#0b0b0d" />
                  </svg>
                </span>
              );
            })}
          </div>

          <div className="gta-map-zoom">
            <button type="button" aria-label="Zoom in" onClick={() => changeZoom(1.6)}>
              <Plus size={16} />
            </button>
            <button type="button" aria-label="Zoom out" onClick={() => changeZoom(1 / 1.6)}>
              <Minus size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
