import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import fetchNui from '@utils/fetchNui';
import { cn } from '@utils/css';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import { ServiceCompaniesResp, ServiceCompany, ServicesEvents } from '@typings/services';

export const CompaniesView: React.FC<{ data: ServiceCompaniesResp | null }> = ({ data }) => {
  const history = useHistory();
  const { addAlert } = useSnackbar();
  const [opening, setOpening] = useState<string | null>(null);

  const message = async (company: ServiceCompany) => {
    setOpening(company.job);
    try {
      const resp = await fetchNui<{ id: number | null }>(ServicesEvents.OPEN_THREAD, { job: company.job }, { id: 1 });
      if (resp?.id) history.push(`/services/thread/${resp.id}`);
      else addAlert({ message: 'Could not reach that company.', type: 'error' });
    } catch (e) {
      addAlert({ message: 'Could not reach that company.', type: 'error' });
    } finally {
      setOpening(null);
    }
  };

  const markLocation = (company: ServiceCompany) => {
    if (!company.location) return;
    fetchNui(ServicesEvents.SET_WAYPOINT, { x: company.location.x, y: company.location.y }, { ok: true }).catch(
      console.error,
    );
    addAlert({ message: `${company.location.name} marked on your GPS.`, type: 'success' });
  };

  if (!data) return <LoadingSpinner />;

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <h1 className="pb-3 pt-2 text-3xl font-bold">Services</h1>

      <div className="flex flex-col gap-3">
        {data.companies.map((company) => (
          <div key={company.job} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800">
            <img
              src={company.icon}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl bg-neutral-100 object-contain p-1.5 dark:bg-neutral-700"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{company.name}</p>
              <p className="flex items-center gap-1.5 truncate text-xs">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', company.open ? 'bg-green-500' : 'bg-neutral-400')} />
                <span className={company.open ? 'text-green-500' : 'text-neutral-500'}>
                  {company.open ? 'Open now' : 'Closed'}
                </span>
                {company.location && <span className="truncate text-neutral-500">· {company.location.name}</span>}
              </p>
            </div>
            {company.location && (
              <button
                type="button"
                aria-label={`Mark ${company.name} on GPS`}
                onClick={() => markLocation(company)}
                className="rounded-full bg-neutral-100 p-2.5 text-sky-500 dark:bg-neutral-700"
              >
                <MapPin size={18} />
              </button>
            )}
            <button
              type="button"
              aria-label={`Message ${company.name}`}
              disabled={opening !== null}
              onClick={() => message(company)}
              className="rounded-full bg-sky-500 p-2.5 text-white disabled:opacity-50"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
