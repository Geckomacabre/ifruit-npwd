import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { DollarSign, HelpCircle, History, Home } from 'lucide-react';

const TABS = [
  { path: '/wallet', label: 'Main', Icon: Home, exact: true },
  { path: '/wallet/pay', label: 'Pay', Icon: DollarSign, exact: false },
  { path: '/wallet/history', label: 'History', Icon: History, exact: false },
  { path: '/wallet/help', label: 'Help', Icon: HelpCircle, exact: false },
];

export const WalletTabBar: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <nav className="buckme-tabbar">
      {TABS.map(({ path, label, Icon, exact }) => {
        const active = exact ? pathname === path : pathname.startsWith(path);

        return (
          <button
            type="button"
            key={path}
            className={`buckme-tab ${active ? 'is-active' : ''}`}
            onClick={() => history.push(path)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
