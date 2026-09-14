import React, { useCallback, useEffect, useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { NPWDInput } from '@ui/components/Input';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import {
  ServiceActionResp,
  ServiceEmployee,
  ServiceEmployment,
  ServiceManagement,
  ServicesEvents,
} from '@typings/services';
import { BrowserManagement, serviceErrorText } from '../utils';

const CARD = 'rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800';

interface BusinessViewProps {
  employment: ServiceEmployment | null;
  onChanged: () => void;
}

export const BusinessView: React.FC<BusinessViewProps> = ({ employment, onChanged }) => {
  const { addAlert } = useSnackbar();
  const [management, setManagement] = useState<ServiceManagement | null>(null);
  const [amount, setAmount] = useState('');
  const [hireId, setHireId] = useState('');
  const [busy, setBusy] = useState(false);

  const isBoss = employment?.isBoss === true;

  const loadManagement = useCallback(async () => {
    if (!isBoss) return;
    try {
      const resp = await fetchNui<ServiceManagement>(ServicesEvents.GET_MANAGEMENT, undefined, BrowserManagement);
      setManagement(resp && !resp.error ? resp : null);
    } catch (e) {
      console.error(e);
    }
  }, [isBoss]);

  useEffect(() => {
    loadManagement();
  }, [loadManagement]);

  if (!employment) {
    return <p className="px-8 py-12 text-center text-neutral-500">You don't work for a listed company.</p>;
  }

  const act = async (
    request: () => Promise<ServiceActionResp>,
    success: string,
  ): Promise<ServiceActionResp | undefined> => {
    if (busy) return;
    setBusy(true);
    try {
      const resp = await request();
      addAlert(
        resp?.ok ? { message: success, type: 'success' } : { message: serviceErrorText(resp?.error), type: 'error' },
      );
      return resp;
    } catch (e) {
      addAlert({ message: serviceErrorText(), type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const toggleDuty = async () => {
    const resp = await act(
      () => fetchNui(ServicesEvents.SET_DUTY, { onDuty: !employment.onDuty }, { ok: true }),
      employment.onDuty ? "You're off duty." : "You're on duty.",
    );
    if (resp?.ok) onChanged();
  };

  const moveMoney = async (direction: 'deposit' | 'withdraw') => {
    const value = Math.floor(Number(amount));
    const mockBalance = (management?.balance ?? 0) + (direction === 'deposit' ? value : -value);
    const resp = await act(
      () => fetchNui(ServicesEvents.MOVE_MONEY, { direction, amount: value }, { ok: true, balance: mockBalance }),
      direction === 'deposit' ? `Deposited $${value.toLocaleString('en-US')}.` : `Withdrew $${value.toLocaleString('en-US')}.`,
    );
    if (resp?.ok) {
      setAmount('');
      setManagement((current) => (current ? { ...current, balance: resp.balance ?? current.balance } : current));
    }
  };

  const fire = async (employee: ServiceEmployee) => {
    const resp = await act(
      () => fetchNui(ServicesEvents.FIRE, { citizenid: employee.citizenid }, { ok: true }),
      `${employee.name} was let go.`,
    );
    if (resp?.ok) loadManagement();
  };

  const setGrade = async (employee: ServiceEmployee, grade: number) => {
    const resp = await act(
      () => fetchNui(ServicesEvents.SET_GRADE, { citizenid: employee.citizenid, grade }, { ok: true }),
      `${employee.name}'s rank was updated.`,
    );
    if (resp?.ok) loadManagement();
  };

  const hire = async () => {
    const resp = await act(
      () => fetchNui(ServicesEvents.HIRE, { targetId: Number(hireId) }, { ok: true }),
      'New hire added.',
    );
    if (resp?.ok) {
      setHireId('');
      loadManagement();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <h1 className="pb-3 pt-2 text-3xl font-bold">{employment.name}</h1>

      <div className="flex flex-col gap-3">
        <section className={cn(CARD, 'flex items-center justify-between gap-3')}>
          <div className="min-w-0">
            <p className="font-semibold">{employment.grade || 'Employee'}</p>
            <p className={cn('text-sm', employment.onDuty ? 'text-green-500' : 'text-neutral-500')}>
              {employment.onDuty ? 'On duty' : 'Off duty'}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={toggleDuty}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50',
              employment.onDuty ? 'bg-red-500' : 'bg-green-500',
            )}
          >
            {employment.onDuty ? 'Go off duty' : 'Go on duty'}
          </button>
        </section>

        {isBoss && management && (
          <>
            <section className={CARD}>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Company account</p>
              <p className="mb-3 text-3xl font-semibold">${management.balance.toLocaleString('en-US')}</p>
              <NPWDInput
                type="number"
                min={1}
                placeholder="Amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || !(Number(amount) > 0)}
                  onClick={() => moveMoney('deposit')}
                  className="flex-1 rounded-xl bg-sky-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Deposit
                </button>
                <button
                  type="button"
                  disabled={busy || !(Number(amount) > 0)}
                  onClick={() => moveMoney('withdraw')}
                  className="flex-1 rounded-xl bg-neutral-200 py-2 text-sm font-semibold text-sky-500 disabled:opacity-50 dark:bg-neutral-700"
                >
                  Withdraw
                </button>
              </div>
            </section>

            <section className={CARD}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Hire</p>
              <div className="flex gap-2">
                <NPWDInput
                  type="number"
                  min={1}
                  placeholder="Server ID (standing next to you)"
                  value={hireId}
                  onChange={(event) => setHireId(event.target.value)}
                />
                <button
                  type="button"
                  aria-label="Hire"
                  disabled={busy || !(Number(hireId) > 0)}
                  onClick={hire}
                  className="rounded-xl bg-sky-500 px-3 text-white disabled:opacity-50"
                >
                  <UserPlus size={18} />
                </button>
              </div>
            </section>

            <section className={CARD}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Staff ({management.employees.length})
              </p>
              <div className="flex flex-col">
                {management.employees.map((employee) => (
                  <div
                    key={employee.citizenid}
                    className="flex items-center gap-2 border-b border-neutral-200 py-2 last:border-none dark:border-neutral-700"
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        employee.onDuty ? 'bg-green-500' : employee.online ? 'bg-yellow-500' : 'bg-neutral-400',
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {employee.name}
                      {employee.isSelf && <span className="text-neutral-500"> (you)</span>}
                    </span>
                    <select
                      value={employee.grade}
                      disabled={busy || employee.isSelf}
                      onChange={(event) => setGrade(employee, Number(event.target.value))}
                      className="rounded-lg bg-neutral-100 px-1.5 py-1 text-xs outline-none disabled:opacity-60 dark:bg-neutral-700"
                    >
                      {management.grades.map((grade) => (
                        <option key={grade.level} value={grade.level}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                    {!employee.isSelf && (
                      <button
                        type="button"
                        aria-label={`Fire ${employee.name}`}
                        disabled={busy}
                        onClick={() => fire(employee)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
