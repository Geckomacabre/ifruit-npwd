import React from 'react';
import { AppWrapper } from '@ui/components';
import { DialerHistory } from './views/DialerHistory';
import { Switch, Route } from 'react-router-dom';
import DialPage from './views/DialPage';
import DialerNavBar from './DialerNavBar';
import { ContactList } from '../../contacts/components/List/ContactList';
import { DialerThemeProvider } from '../providers/DialerThemeProvider';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';

// Pure black background regardless of the phone's light/dark theme, matching
// Calculator and Clock -- real iOS keeps its utility apps black-on-black
// rather than following the system appearance.
export const DialerApp: React.FC = () => {
  return (
    <DialerThemeProvider>
      <AppWrapper fullBleed>
        <div className="relative flex flex-1 flex-col overflow-hidden bg-black pt-12 text-white">
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <React.Suspense fallback={<LoadingSpinner />}>
              <Switch>
                <Route path="/phone/dial">
                  <DialPage />
                </Route>
                <Route path="/phone/contacts" component={ContactList} />
                <Route exact path="/phone">
                  <DialerHistory />
                </Route>
              </Switch>
            </React.Suspense>
          </div>

          <DialerNavBar />
        </div>
      </AppWrapper>
    </DialerThemeProvider>
  );
};