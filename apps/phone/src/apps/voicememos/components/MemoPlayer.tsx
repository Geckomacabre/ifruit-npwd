import React, { useEffect, useRef, useState } from 'react';
import { Pause, Pencil, Play, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { cn } from '@utils/css';
import { VoiceMemo } from '@typings/voicememos';
import { formatDuration } from '../utils';

const SKIP_SECONDS = 15;

interface MemoPlayerProps {
  memo: VoiceMemo;
  onRename: () => void;
  onDelete: () => void;
}

export const MemoPlayer: React.FC<MemoPlayerProps> = ({ memo, onRename, onDelete }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  // MediaRecorder ogg files often report an Infinity duration, so the length
  // measured while recording is the fallback.
  const [length, setLength] = useState(memo.duration);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const audio = new Audio(memo.url);
    audioRef.current = audio;

    const onTime = () => setPosition(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setPosition(0);
    };
    const onMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setLength(audio.duration);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onMetadata);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onMetadata);
      audioRef.current = null;
    };
  }, [memo.url]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(length, seconds));
    setPosition(audio.currentTime);
  };

  return (
    <div className="pt-3" onClick={(event) => event.stopPropagation()}>
      <input
        type="range"
        min={0}
        max={Math.max(length, 0.1)}
        step={0.1}
        value={Math.min(position, length)}
        onChange={(event) => seek(Number(event.target.value))}
        className="w-full accent-white"
        aria-label="Playback position"
      />
      <div className="flex justify-between text-xs tabular-nums text-neutral-400">
        <span>{formatDuration(position)}</span>
        <span>-{formatDuration(Math.max(0, length - position))}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button type="button" aria-label="Rename" onClick={onRename} className="p-2 text-sky-400">
          <Pencil size={20} />
        </button>

        <div className="flex items-center gap-6">
          <button type="button" aria-label="Back 15 seconds" onClick={() => seek(position - SKIP_SECONDS)}>
            <RotateCcw size={26} />
          </button>
          <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
            {playing ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
          </button>
          <button type="button" aria-label="Forward 15 seconds" onClick={() => seek(position + SKIP_SECONDS)}>
            <RotateCw size={26} />
          </button>
        </div>

        <button
          type="button"
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete'}
          onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
          className={cn('rounded-lg p-2', confirmDelete ? 'bg-red-500 text-white' : 'text-sky-400')}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
