import React, { useMemo } from 'react';
import { WeatherCondition } from '@typings/weather';
import { celestial, nightnessAt, OVERCAST, seeded, skyStops } from '../utils/sky';

interface SkySceneProps {
  condition: WeatherCondition;
  hour: number;
  minute: number;
}

const WET: WeatherCondition[] = ['drizzle', 'rain', 'heavy-rain', 'thunder', 'storm'];
const DROP_COUNT: Partial<Record<WeatherCondition, number>> = {
  drizzle: 18,
  rain: 34,
  thunder: 40,
  'heavy-rain': 52,
  storm: 58,
};

// The sky behind the Weather app: the server's clock drives the gradient and
// the sun/moon arc, the current condition drives what falls out of it.
export const SkyScene: React.FC<SkySceneProps> = ({ condition, hour, minute }) => {
  const time = hour + minute / 60;
  const overcast = OVERCAST[condition] ?? 0;
  const nightness = nightnessAt(time);
  const { top, bottom } = skyStops(time, overcast);
  const body = celestial(time);

  const windy = condition === 'windy' || condition === 'storm';
  const cloudCount = Math.round(overcast * 7);
  const starOpacity = Math.max(0, nightness - overcast * 1.3);

  const scene = useMemo(() => {
    const rand = seeded(condition.length * 7919 + cloudCount * 104729 + 11);

    const stars = Array.from({ length: 44 }, () => ({
      left: rand() * 100,
      top: rand() * 62,
      size: 1 + rand() * 1.8,
      duration: 2.5 + rand() * 4,
      delay: rand() * 5,
    }));

    const clouds = Array.from({ length: cloudCount }, () => {
      const scale = 0.6 + rand() * 0.8;
      return {
        top: 4 + rand() * 46,
        scale,
        duration: (windy ? 26 : 62) + rand() * (windy ? 14 : 44),
        delay: -rand() * 60,
        opacity: 0.4 + rand() * 0.45,
        // Each cloud is a few overlapping blobs on a shared baseline.
        blobs: [
          { w: 96, h: 52, left: 0 },
          { w: 68, h: 68, left: 40 },
          { w: 80, h: 46, left: 86 },
          { w: 58, h: 40, left: 138 },
        ],
      };
    });

    const drops = Array.from({ length: DROP_COUNT[condition] ?? 0 }, () => ({
      left: rand() * 100,
      height: 12 + rand() * 16,
      duration: 0.5 + rand() * 0.5,
      delay: -rand() * 2,
      opacity: 0.35 + rand() * 0.5,
    }));

    const flakes =
      condition === 'snow'
        ? Array.from({ length: 34 }, () => ({
            left: rand() * 100,
            size: 2 + rand() * 3.5,
            duration: 6 + rand() * 7,
            delay: -rand() * 10,
            opacity: 0.5 + rand() * 0.5,
          }))
        : [];

    return { stars, clouds, drops, flakes };
  }, [condition, cloudCount, windy]);

  return (
    <div className="wx-sky" style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      {starOpacity > 0.02 &&
        scene.stars.map((star, i) => (
          <span
            key={`star-${i}`}
            className="wx-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              height: star.size,
              width: star.size,
              opacity: starOpacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

      <div
        className={body.isSun ? 'wx-sun' : 'wx-moon'}
        style={{
          left: `${body.x}%`,
          top: `${body.y}%`,
          // A heavy overcast hides the sun/moon behind the cloud deck.
          opacity: Math.max(0, 1 - overcast * 1.15),
        }}
      />

      {scene.clouds.map((cloud, i) => (
        <div
          key={`cloud-${i}`}
          className="wx-cloud"
          style={{
            top: `${cloud.top}%`,
            opacity: cloud.opacity,
            transform: `scale(${cloud.scale})`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
            height: 70,
            width: 200,
          }}
        >
          {cloud.blobs.map((blob, b) => (
            <span key={b} style={{ height: blob.h, width: blob.w, left: blob.left }} />
          ))}
        </div>
      ))}

      {condition === 'fog' && (
        <>
          <div className="wx-fog" style={{ top: '38%', animationDuration: '17s' }} />
          <div className="wx-fog" style={{ top: '56%', animationDuration: '23s', animationDelay: '-6s' }} />
          <div className="wx-fog" style={{ top: '72%', animationDuration: '29s', animationDelay: '-12s' }} />
        </>
      )}

      {WET.includes(condition) &&
        scene.drops.map((drop, i) => (
          <span
            key={`drop-${i}`}
            className="wx-drop"
            style={{
              left: `${drop.left}%`,
              height: drop.height,
              opacity: drop.opacity,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
            }}
          />
        ))}

      {scene.flakes.map((flake, i) => (
        <span
          key={`flake-${i}`}
          className="wx-flake"
          style={{
            left: `${flake.left}%`,
            height: flake.size,
            width: flake.size,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}

      {(condition === 'thunder' || condition === 'storm') && <div className="wx-flash" />}

      <div className="wx-scrim" />
    </div>
  );
};
