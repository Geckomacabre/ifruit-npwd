import React, { useCallback, useEffect, useState } from 'react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import fetchNui from '@utils/fetchNui';
import { CrimeAppData, CrimeEvents } from '@typings/crime';
import { AuthGate } from './components/AuthGate';
import { ReportFeed } from './components/ReportFeed';
import { BrowserCrimeData } from './utils';

// "Citizen"-style community safety app, ported from noted_crimeapp. The
// account layer is the resource's own -- username/password kept per character
// -- so the app opens on a login wall rather than assuming the phone's owner.
export const CrimeApp: React.FC = () => {
  const [data, setData] = useState<CrimeAppData | null>(null);

  const load = useCallback(async () => {
    const resp = await fetchNui<CrimeAppData>(CrimeEvents.GET_APP_DATA, undefined, BrowserCrimeData);
    setData(resp ?? null);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  if (!data) {
    return (
      <AppWrapper id="crime-app">
        <LoadingSpinner />
      </AppWrapper>
    );
  }

  return (
    <AppWrapper id="crime-app">
      {data.account ? (
        <ReportFeed data={data} reload={load} />
      ) : (
        <AuthGate onAuthed={load} />
      )}
    </AppWrapper>
  );
};
