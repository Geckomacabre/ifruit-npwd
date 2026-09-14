import React, { useMemo, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useFilteredContacts } from '../../hooks/state';
import { Contact } from '@typings/contact';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { Plus, Search, Mic, Clipboard, UsersRound } from 'lucide-react';
import { initials } from '@utils/misc';
import { useTwitterProfileValue } from '@apps/twitter/hooks/state';
import { useTranslation } from 'react-i18next';
import { setClipboard } from '@os/phone/hooks';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { ContactEvents } from '@typings/contact';
import fetchNui from '@utils/fetchNui';
import { Tooltip } from '@ui/components/Tooltip';
import { SearchContacts } from './SearchContacts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

// Real iOS Contacts: tapping a row opens its detail card (call/message live
// there, at /contacts/:id -- see ContactInfo.tsx), not inline buttons in the
// list. Sections get a plain sticky letter label over a hairline, not a
// boxed pill. A floating bottom bar carries search + add, and an A-Z rail
// down the right edge jumps straight to a section.
export const ContactList: React.FC = () => {
  const filteredContacts = useFilteredContacts();
  const myNumber = useMyPhoneNumber();
  const { avatar_url } = useTwitterProfileValue();
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    for (const contact of filteredContacts) {
      const letter = /[A-Z]/i.test(contact.display.charAt(0))
        ? contact.display.charAt(0).toUpperCase()
        : '#';
      (groups[letter] ??= []).push(contact);
    }
    return groups;
  }, [filteredContacts]);

  const letters = Object.keys(groupedContacts).sort();

  const scrollToLetter = (letter: string) => {
    const section = sectionRefs.current[letter];
    if (section && listRef.current) {
      listRef.current.scrollTo({ top: section.offsetTop, behavior: 'auto' });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <h1 className="px-4 pb-2 pt-1 text-3xl font-bold">Contacts</h1>

      <div ref={listRef} className="flex-1 overflow-y-auto pb-24 pr-6">
        <SelfContact number={myNumber} avatar={avatar_url} />

        {letters.map((letter) => (
          <div key={letter} ref={(el) => (sectionRefs.current[letter] = el)}>
            <div className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-100/95 px-4 py-1 text-sm font-medium text-neutral-500 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
              {letter}
            </div>
            {groupedContacts[letter].map((contact) => (
              <ContactRow key={contact.id} {...contact} />
            ))}
          </div>
        ))}
      </div>

      {/* Real iOS shows this A-Z rail unconditionally, even with a short
          contact list. */}
      <div className="absolute bottom-24 right-0.5 top-14 flex flex-col items-center justify-center">
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => scrollToLetter(letter)}
            disabled={!groupedContacts[letter]}
            className={
              groupedContacts[letter]
                ? 'text-[10px] font-semibold leading-[13px] text-blue-500'
                : 'text-[10px] font-semibold leading-[13px] text-neutral-600'
            }
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Floating bottom bar, same convention as Control Center/dock glass. */}
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-neutral-200 px-3 py-2 dark:bg-neutral-800">
          <SearchContacts />
          <Mic size={18} className="shrink-0 text-neutral-400" />
        </div>
        <Link
          to="/contacts/-1"
          aria-label="New contact"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
        >
          <Plus size={22} />
        </Link>
      </div>
    </div>
  );
};

const AVATAR_FALLBACK_CLASS = 'bg-neutral-400 text-white dark:bg-neutral-600';

const Avatar: React.FC<{ avatar?: string; label: string }> = ({ avatar, label }) =>
  avatar ? (
    <img src={avatar} className="h-11 w-11 shrink-0 rounded-full object-cover" alt="" />
  ) : (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-medium ${AVATAR_FALLBACK_CLASS}`}
    >
      {label}
    </div>
  );

const SelfContact: React.FC<{ number: string; avatar: string }> = ({ number, avatar }) => {
  const [t] = useTranslation();
  const { addAlert } = useSnackbar();

  const copyNumber = () => {
    setClipboard(number);
    addAlert({
      message: t('GENERIC.WRITE_TO_CLIPBOARD_MESSAGE', { content: 'Number' }),
      type: 'success',
    });
  };

  const shareLocal = () => fetchNui(ContactEvents.LOCAL_SHARE);

  return (
    <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <Avatar avatar={avatar} label="Me" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-medium">{t('CONTACTS.MY_NUMBER')}</p>
        <p className="text-sm text-neutral-400">{number}</p>
      </div>
      <Tooltip title={t('GENERIC.WRITE_TO_CLIPBOARD_TOOLTIP', { content: 'Number' }) as string}>
        <button onClick={copyNumber} className="rounded-full p-2 text-neutral-400">
          <Clipboard size={20} />
        </button>
      </Tooltip>
      <Tooltip title={t('CONTACTS.NEARBY_SHARE') as string}>
        <button onClick={shareLocal} className="rounded-full p-2 text-neutral-400">
          <UsersRound size={20} />
        </button>
      </Tooltip>
    </div>
  );
};

const ContactRow: React.FC<Contact> = ({ number, avatar, id, display }) => {
  const history = useHistory();
  const query = new URLSearchParams(history.location.search);
  const referal = query.get('referal');

  const to = referal
    ? `${referal}?contact=${encodeURIComponent(JSON.stringify({ number, id, display }))}`
    : `/contacts/${id}`;

  return (
    <Link
      to={to}
      className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800"
    >
      <Avatar avatar={avatar} label={initials(display)} />
      <p className="truncate text-[17px]">{display}</p>
    </Link>
  );
};
