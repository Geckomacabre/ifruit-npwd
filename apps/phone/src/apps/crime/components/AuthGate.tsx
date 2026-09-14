import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { CrimeEvents, CrimeResult } from '@typings/crime';

type Mode = 'login' | 'signup';

export const AuthGate: React.FC<{ onAuthed: () => void }> = ({ onAuthed }) => {
  const { addAlert } = useSnackbar();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (mode === 'signup' && password !== confirm) {
      addAlert({ message: 'Those passwords do not match.', type: 'error' });
      return;
    }

    setBusy(true);
    try {
      const result = await fetchNui<CrimeResult>(
        mode === 'login' ? CrimeEvents.LOGIN : CrimeEvents.SIGNUP,
        { username, password, confirm },
        { ok: true },
      );

      if (!result?.ok) {
        addAlert({ message: result?.err ?? 'That did not work.', type: 'error' });
        return;
      }
      onAuthed();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-6 text-neutral-900 dark:text-neutral-100">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white">
          <ShieldAlert size={28} />
        </span>
        <h1 className="text-2xl font-bold">Citizen</h1>
        <p className="mt-1 text-sm text-neutral-500">
          See what is happening around you, and tell people what you see.
        </p>
      </div>

      <div className="mb-4 flex gap-1 rounded-full bg-neutral-200 p-1 dark:bg-neutral-800">
        {(['login', 'signup'] as Mode[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={cn(
              'flex-1 rounded-full py-1.5 text-[13px] font-semibold',
              mode === option && 'bg-white text-black shadow dark:bg-neutral-600 dark:text-white',
            )}
          >
            {option === 'login' ? 'Log in' : 'Create account'}
          </button>
        ))}
      </div>

      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Username"
        className="mb-2 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="mb-2 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
      />
      {mode === 'signup' && (
        <input
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Confirm password"
          className="mb-2 w-full rounded-2xl bg-white p-3 outline-none dark:bg-neutral-800"
        />
      )}

      <button
        type="button"
        disabled={busy || !username.trim() || !password}
        onClick={submit}
        className="mt-2 w-full rounded-2xl bg-red-500 py-3 font-semibold text-white disabled:opacity-50"
      >
        {mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </div>
  );
};
