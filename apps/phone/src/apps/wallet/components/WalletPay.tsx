import React, { useMemo, useState } from 'react';
import { CheckCircle2, Delete } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import {
  WalletCheckNumberResp,
  WalletEvents,
  WalletSendPaymentResp,
} from '@typings/wallet';
import { NPWDInput } from '@ui/components/Input';
import { useContactsValue } from '@apps/contacts/hooks/state';
import { useWalletOverview } from '../hooks/useWalletOverview';
import { paymentErrorText, REQUEST_POPUP } from '../utils/constants';
import { formatCounterparty, formatMoney } from '../utils/format';

type Step = 'recipient' | 'amount' | 'done';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];
const MAX_DIGITS = 7;

export const WalletPay: React.FC = () => {
  const contacts = useContactsValue();
  const { overview, refresh } = useWalletOverview();

  const [step, setStep] = useState<Step>('recipient');
  const [mode, setMode] = useState<'pay' | 'request'>('pay');
  const [query, setQuery] = useState('');
  const [number, setNumber] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [busy, setBusy] = useState(false);

  const amount = Number(digits) || 0;

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = search
      ? contacts.filter(
          (contact) => contact.display.toLowerCase().includes(search) || contact.number.includes(search),
        )
      : contacts;
    return filtered.slice(0, 6);
  }, [contacts, query]);

  const chooseRecipient = async (target: string) => {
    if (mode === 'request') return setShowRequestPopup(true);

    const trimmed = target.trim();
    if (!trimmed || busy) return;

    setError(null);
    setBusy(true);

    try {
      const resp = await fetchNui<ServerPromiseResp<WalletCheckNumberResp>>(
        WalletEvents.CHECK_NUMBER,
        { number: trimmed },
        { status: 'ok', data: { name: 'Trevor Philips' } },
      );
      if (resp.status !== 'ok') return setError(paymentErrorText(resp.errorMsg));

      setNumber(trimmed);
      setRecipientName(resp.data.name);
      setDigits('');
      setStep('amount');
    } catch (e) {
      setError(paymentErrorText());
    } finally {
      setBusy(false);
    }
  };

  // Typing a name that matches exactly one contact pays that contact.
  const submitQuery = () => chooseRecipient(matches.length === 1 ? matches[0].number : query);

  const pressKey = (key: string) => {
    setError(null);
    if (key === 'back') return setDigits((value) => value.slice(0, -1));
    setDigits((value) =>
      value.length >= MAX_DIGITS || (value === '' && key === '0') ? value : value + key,
    );
  };

  const send = async () => {
    if (!amount || busy) return;
    if (overview && amount > overview.balance) {
      return setError(paymentErrorText('INSUFFICIENT_FUNDS'));
    }

    setError(null);
    setBusy(true);

    try {
      const resp = await fetchNui<ServerPromiseResp<WalletSendPaymentResp>>(
        WalletEvents.SEND_PAYMENT,
        { number, amount },
        { status: 'ok', data: { balance: 0 } },
      );
      if (resp.status !== 'ok') return setError(paymentErrorText(resp.errorMsg));

      setStep('done');
      refresh();
    } catch (e) {
      setError(paymentErrorText());
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep('recipient');
    setQuery('');
    setNumber('');
    setRecipientName(null);
    setDigits('');
    setError(null);
  };

  const recipientLabel = recipientName ?? formatCounterparty(number);

  return (
    <div className="buckme-screen">
      {step === 'recipient' && (
        <>
          <header className="buckme-header">
            <h3>{mode === 'pay' ? 'Send money' : 'Request money'}</h3>
          </header>

          <div className="buckme-toggle">
            <button
              type="button"
              className={mode === 'pay' ? 'is-active' : ''}
              onClick={() => setMode('pay')}
            >
              Pay
            </button>
            <button
              type="button"
              className={mode === 'request' ? 'is-active' : ''}
              onClick={() => setMode('request')}
            >
              Request
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitQuery();
            }}
          >
            <NPWDInput
              className="buckme-input"
              placeholder="Name or phone number"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          {matches.length > 0 && (
            <div className="buckme-tx-list buckme-contacts">
              {matches.map((contact) => (
                <button
                  type="button"
                  key={contact.id}
                  className="buckme-tx"
                  disabled={busy}
                  onClick={() => chooseRecipient(contact.number)}
                >
                  <div className="buckme-tx-avatar">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt="" />
                    ) : (
                      contact.display.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="buckme-tx-body">
                    <span className="buckme-tx-title">{contact.display}</span>
                    <span className="buckme-tx-time">{formatCounterparty(contact.number)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {error && <div className="buckme-error">{error}</div>}

          <button
            type="button"
            className="buckme-button buckme-spaced"
            disabled={!query.trim() || busy}
            onClick={submitQuery}
          >
            {busy ? 'Checking…' : 'Next'}
          </button>
        </>
      )}

      {step === 'amount' && (
        <>
          <header className="buckme-header">
            <button type="button" className="buckme-link" onClick={reset}>
              Cancel
            </button>
          </header>

          <div className="buckme-amount">{formatMoney(amount)}</div>
          <div className="buckme-amount-to">to {recipientLabel}</div>
          {overview && (
            <div className="buckme-amount-balance">Balance {formatMoney(overview.balance)}</div>
          )}

          <div className="buckme-numpad">
            {KEYS.map((key, index) =>
              key ? (
                <button
                  type="button"
                  key={key}
                  className="buckme-key"
                  onClick={() => pressKey(key)}
                  aria-label={key === 'back' ? 'Delete' : key}
                >
                  {key === 'back' ? <Delete size={24} /> : key}
                </button>
              ) : (
                <span key={`blank-${index}`} />
              ),
            )}
          </div>

          {error && <div className="buckme-error">{error}</div>}

          <button
            type="button"
            className="buckme-button buckme-spaced"
            disabled={!amount || busy}
            onClick={send}
          >
            {busy ? 'Sending…' : `Pay ${formatMoney(amount)}`}
          </button>
        </>
      )}

      {step === 'done' && (
        <div className="buckme-done">
          <CheckCircle2 size={72} />
          <h3>Sent {formatMoney(amount)}</h3>
          <p>to {recipientLabel}</p>
          <button type="button" className="buckme-button buckme-spaced" onClick={reset}>
            Done
          </button>
        </div>
      )}

      {showRequestPopup && (
        <div className="buckme-popup-backdrop" onClick={() => setShowRequestPopup(false)}>
          <div className="buckme-popup" onClick={(event) => event.stopPropagation()}>
            <h4>{REQUEST_POPUP.title}</h4>
            <p>{REQUEST_POPUP.description}</p>
            <button type="button" className="buckme-button" onClick={() => setShowRequestPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
