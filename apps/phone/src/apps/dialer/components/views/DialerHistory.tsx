import React, { useCallback } from 'react';
import { useContactActions } from '../../../contacts/hooks/useContactActions';
import { CallHistoryItem } from '@typings/call';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { useDialHistory } from '../../hooks/useDialHistory';
import { useCall } from '@os/call/hooks/useCall';
import { useContacts } from '../../../contacts/hooks/state';
import { Phone, PhoneForwarded, PhoneIncoming, UserRoundPlus } from 'lucide-react';
import { cn } from '@utils/css';

// Real iOS Recents: a plain black flat list (no card grouping), a bold
// direction glyph, name/number, the relative time below it, and the call
// button only appearing as a tap target on the right -- not the
// gray-card-on-black look Settings-style apps use, which reads wrong here.
export const DialerHistory: React.FC = () => {
  const myNumber = useMyPhoneNumber();
  const { getDisplayByNumber } = useContactActions();
  const { initializeCall } = useCall();
  const calls = useDialHistory();
  const contacts = useContacts();
  const history = useHistory();
  const [t] = useTranslation();

  const handleCall = (phoneNumber: string) => {
    initializeCall(phoneNumber);
  };

  // To display the name, force a re-render when we get contacts | issue #432
  const getDisplay = useCallback(
    (number: string) => (contacts.length ? getDisplayByNumber(number) : number),
    [contacts, getDisplayByNumber],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <h1 className="px-4 pb-2 text-3xl font-bold">Recents</h1>

      {!calls?.length ? (
        <div className="flex flex-1 items-center justify-center text-neutral-500">
          <p>
            {t('DIALER.NO_HISTORY')} <span role="img" aria-label="sad">😞</span>
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {calls.map((call: CallHistoryItem) => {
            const outgoing = call.transmitter === myNumber;
            const number = outgoing ? call.receiver : call.transmitter;
            const label = call.isAnonymous ? 'Anonymous' : getDisplay(number);
            const isUnknown = !call.isAnonymous && label === number;

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3"
              >
                {outgoing ? (
                  <PhoneForwarded size={18} className="shrink-0 text-green-500" />
                ) : (
                  <PhoneIncoming size={18} className="shrink-0 text-red-500" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px]">{label}</div>
                  <div className="text-[13px] text-neutral-500">
                    {dayjs().to(dayjs.unix(parseInt(call.start)))}
                  </div>
                </div>

                {isUnknown && (
                  <button
                    type="button"
                    aria-label="Add contact"
                    onClick={() =>
                      history.push(`/contacts/-1?addNumber=${number}&referal=/phone/contacts`)
                    }
                    className="shrink-0 rounded-full p-2 text-neutral-400"
                  >
                    <UserRoundPlus size={20} />
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Call"
                  disabled={call.isAnonymous}
                  onClick={() => handleCall(number)}
                  className={cn(
                    'shrink-0 rounded-full p-2',
                    call.isAnonymous ? 'text-neutral-700' : 'text-green-500',
                  )}
                >
                  <Phone size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
