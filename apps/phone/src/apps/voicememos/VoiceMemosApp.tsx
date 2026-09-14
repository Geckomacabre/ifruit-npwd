import React, { useCallback, useEffect, useRef, useState } from 'react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { blobToBase64 } from '@utils/seralize';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { NPWDInput } from '@ui/components/Input';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { useRecorder } from '@os/audio/hooks/useRecorder';
import { ServerPromiseResp } from '@typings/common';
import { AudioEvents, AudioRequest, AudioResponse } from '@typings/audio';
import { VOICE_MEMO_MAX_SECONDS, VOICE_MEMO_NAME_MAX, VoiceMemo, VoiceMemoEvents } from '@typings/voicememos';
import { MemoPlayer } from './components/MemoPlayer';
import { BrowserMemos, formatDuration, formatElapsed, formatMemoDate, memoErrorText } from './utils';

export const VoiceMemosApp: React.FC = () => {
  const { addAlert } = useSnackbar();
  const { blob, startRecording, stopRecording } = useRecorder();

  const [memos, setMemos] = useState<VoiceMemo[] | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const durationRef = useRef(0);

  useEffect(() => {
    fetchNui<ServerPromiseResp<VoiceMemo[]>>(VoiceMemoEvents.FETCH, undefined, { status: 'ok', data: BrowserMemos })
      .then((resp) => setMemos(resp.status === 'ok' ? resp.data : []))
      .catch((e) => {
        console.error(e);
        setMemos([]);
      });
  }, []);

  const stop = useCallback(() => {
    if (startedAt === null) return;
    durationRef.current = Math.round((Date.now() - startedAt) / 1000);
    setStartedAt(null);
    stopRecording();
  }, [startedAt, stopRecording]);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (startedAt !== null && elapsed >= VOICE_MEMO_MAX_SECONDS * 1000) stop();
  }, [elapsed, startedAt, stop]);

  const start = async () => {
    try {
      await startRecording();
      setElapsed(0);
      setStartedAt(Date.now());
    } catch (e) {
      addAlert({ message: 'Microphone access was blocked.', type: 'error' });
    }
  };

  // A finished recording arrives as a new blob: upload it, then keep the link.
  useEffect(() => {
    if (!blob) return;

    const save = async () => {
      setSaving(true);
      try {
        const file = await blobToBase64(blob);
        const upload = await fetchNui<ServerPromiseResp<AudioResponse>, AudioRequest>(
          AudioEvents.UPLOAD_AUDIO,
          { file, size: blob.size },
          { status: 'ok', data: { url: 'https://r2.fivemanage.com/new-memo.ogg' } },
        );
        if (upload.status !== 'ok') {
          addAlert({ message: memoErrorText(upload.errorMsg), type: 'error' });
          return;
        }

        const duration = durationRef.current;
        const name = 'New Recording';
        const resp = await fetchNui<ServerPromiseResp<VoiceMemo>>(
          VoiceMemoEvents.SAVE,
          { name, url: upload.data.url, duration },
          { status: 'ok', data: { id: Date.now(), name, url: upload.data.url, duration, createdAt: Date.now() } },
        );
        if (resp.status !== 'ok') {
          addAlert({ message: memoErrorText(resp.errorMsg), type: 'error' });
          return;
        }

        setMemos((previous) => [resp.data, ...(previous ?? [])]);
        setExpandedId(resp.data.id);
      } catch (e) {
        addAlert({ message: memoErrorText(), type: 'error' });
      } finally {
        setSaving(false);
      }
    };

    save();
  }, [blob, addAlert]);

  const commitRename = async () => {
    if (!renaming) return;
    const name = renaming.name.trim();
    setRenaming(null);

    const memo = memos?.find((m) => m.id === renaming.id);
    if (!memo || !name || name === memo.name) return;

    const resp = await fetchNui<ServerPromiseResp>(VoiceMemoEvents.RENAME, { id: memo.id, name }, { status: 'ok' });
    if (resp.status !== 'ok') return addAlert({ message: memoErrorText(resp.errorMsg), type: 'error' });

    setMemos((previous) => previous?.map((m) => (m.id === memo.id ? { ...m, name } : m)) ?? previous);
  };

  const remove = async (memo: VoiceMemo) => {
    const resp = await fetchNui<ServerPromiseResp>(VoiceMemoEvents.DELETE, { id: memo.id }, { status: 'ok' });
    if (resp.status !== 'ok') return addAlert({ message: memoErrorText(resp.errorMsg), type: 'error' });

    setMemos((previous) => previous?.filter((m) => m.id !== memo.id) ?? previous);
    setExpandedId(null);
  };

  const recording = startedAt !== null;

  return (
    <AppWrapper id="voicememos-app" fullBleed>
      <div className="relative flex flex-1 flex-col overflow-hidden bg-black pt-12 text-white">
        <h1 className="px-4 pb-3 text-3xl font-bold">All Recordings</h1>

        <div className="flex-1 overflow-y-auto px-4 pb-40">
          {memos === null && <LoadingSpinner />}
          {memos?.length === 0 && (
            <p className="py-16 text-center text-neutral-500">Tap the record button to make your first recording.</p>
          )}

          {memos?.map((memo) => {
            const expanded = memo.id === expandedId;
            const isRenaming = renaming?.id === memo.id;

            return (
              <div
                key={memo.id}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(expanded ? null : memo.id)}
                className={cn(
                  'border-b border-neutral-800 py-3',
                  expanded && 'rounded-2xl border-none bg-neutral-900 px-3',
                )}
              >
                {isRenaming ? (
                  <form
                    onClick={(event) => event.stopPropagation()}
                    onSubmit={(event) => {
                      event.preventDefault();
                      commitRename();
                    }}
                  >
                    <NPWDInput
                      autoFocus
                      value={renaming.name}
                      maxLength={VOICE_MEMO_NAME_MAX}
                      onChange={(event) => setRenaming({ id: memo.id, name: event.target.value })}
                      onBlur={commitRename}
                      className="bg-neutral-800 text-white dark:bg-neutral-800"
                    />
                  </form>
                ) : (
                  <p className="truncate font-semibold">{memo.name}</p>
                )}
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>{formatMemoDate(memo.createdAt)}</span>
                  <span className="tabular-nums">{formatDuration(memo.duration)}</span>
                </div>

                {expanded && (
                  <MemoPlayer
                    memo={memo}
                    onRename={() => setRenaming({ id: memo.id, name: memo.name })}
                    onDelete={() => remove(memo)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="liquid-glass liquid-glass-dark liquid-glass-bar absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-9 pt-4">
          <span className={cn('text-lg tabular-nums', recording ? 'text-white' : 'text-neutral-500')}>
            {saving ? 'Saving…' : formatElapsed(recording ? elapsed : 0)}
          </span>
          <button
            type="button"
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            disabled={saving}
            onClick={recording ? stop : start}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white/90 disabled:opacity-50"
          >
            <span
              className={cn(
                'bg-red-500 transition-all duration-200',
                recording ? 'h-7 w-7 rounded-md' : 'h-14 w-14 rounded-full',
              )}
            />
          </button>
        </div>
      </div>
    </AppWrapper>
  );
};
