import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { Briefcase, Building, MessageCircle } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { AppWrapper } from '@ui/components';
import { ServiceCompaniesResp, ServicesEvents } from '@typings/services';
import { BrowserCompanies } from './utils';
import { CompaniesView } from './components/CompaniesView';
import { ThreadsView } from './components/ThreadsView';
import { ThreadView } from './components/ThreadView';
import { BusinessView } from './components/BusinessView';

export const ServicesApp: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [data, setData] = useState<ServiceCompaniesResp | null>(null);

  const load = useCallback(async () => {
    try {
      const resp = await fetchNui<ServiceCompaniesResp>(ServicesEvents.GET_COMPANIES, undefined, BrowserCompanies);
      setData(resp?.companies ? resp : { companies: [], employment: null });
    } catch (e) {
      console.error(e);
      setData({ companies: [], employment: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tabs = [
    { path: '/services', label: 'Companies', Icon: Building, exact: true },
    { path: '/services/messages', label: 'Messages', Icon: MessageCircle, exact: false },
    ...(data?.employment ? [{ path: '/services/business', label: 'Business', Icon: Briefcase, exact: false }] : []),
  ];

  const inThread = pathname.startsWith('/services/thread/');

  return (
    <AppWrapper id="services-app">
      <div className="flex flex-1 flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Switch>
            <Route path="/services/thread/:id" component={ThreadView} />
            <Route path="/services/messages" component={ThreadsView} />
            <Route
              path="/services/business"
              render={() => <BusinessView employment={data?.employment ?? null} onChanged={load} />}
            />
            <Route path="/services" render={() => <CompaniesView data={data} />} />
          </Switch>
        </div>

        {!inThread && (
          <nav className="liquid-glass liquid-glass-bar flex pb-7 pt-2">
            {tabs.map(({ path, label, Icon, exact }) => {
              const active = exact ? pathname === path : pathname.startsWith(path);
              return (
                <button
                  type="button"
                  key={path}
                  onClick={() => history.push(path)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 text-[11px]',
                    active ? 'text-sky-500' : 'text-neutral-500',
                  )}
                >
                  <Icon size={22} />
                  {label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </AppWrapper>
  );
};
