import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppWrapper } from '@ui/components';
import { useNuiEvent } from '@common/hooks/useNuiEvent';
import { MailEvents } from '@typings/mail';
import { useMailbox } from './hooks/useMailbox';
import { MailList } from './components/MailList';
import { MailDetail } from './components/MailDetail';
import { MailCompose } from './components/MailCompose';

export const MailApp: React.FC = () => {
  const { refresh, addMessage } = useMailbox();

  useEffect(() => {
    refresh();
  }, [refresh]);

  useNuiEvent('EMAIL', MailEvents.NEW_MAIL, addMessage);

  return (
    <AppWrapper id="mail-app" fullBleed>
      <div className="flex flex-1 flex-col overflow-hidden bg-neutral-100 pt-12 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Switch>
          <Route path="/mail/compose" component={MailCompose} />
          <Route path="/mail/:id" component={MailDetail} />
          <Route path="/mail" component={MailList} />
        </Switch>
      </div>
    </AppWrapper>
  );
};
