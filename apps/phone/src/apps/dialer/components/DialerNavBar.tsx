import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { History, Phone, Contact } from 'lucide-react';
import { cn } from '@utils/css';

// Matches the floating pill tab bar established by Clock/Alarms
// (liquid-glass-bar) rather than the plain full-width MUI BottomNavigation
// this used to be -- real iOS labels these Recents/Keypad/Contacts, not
// History/Dial/Contacts.
const TABS = [
  { path: '/phone', label: 'Recents', Icon: History, exact: true },
  { path: '/phone/dial', label: 'Keypad', Icon: Phone, exact: false },
  { path: '/phone/contacts', label: 'Contacts', Icon: Contact, exact: false },
];

const DialerNavBar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav className="liquid-glass liquid-glass-dark liquid-glass-bar flex pb-6 pt-2">
      {TABS.map(({ path, label, Icon, exact }) => {
        const active = exact ? pathname === path : pathname.startsWith(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 text-[11px]',
              active ? 'text-blue-500' : 'text-neutral-500',
            )}
          >
            {/* Real iOS puts a dark capsule behind only the selected tab's
                icon -- the label alone changing color (Clock's treatment)
                isn't how the Phone app itself does it. */}
            <span className={cn('rounded-full px-3 py-1', active && 'bg-white/10')}>
              <Icon size={22} />
            </span>
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default DialerNavBar;
