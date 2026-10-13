import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronLeft, Home as HomeIcon, MapPin, Music, X } from 'lucide-react';
import { AppWrapper } from '@ui/components';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import {
  CatalogOption,
  ForeclosureBuyResponse,
  ForeclosureCatalog,
  ForeclosureChoices,
  ForeclosureEvents,
  ForeclosureListing,
  ForeclosureMarket,
  ForeclosureQuote,
  ForeclosureQuoteResponse,
} from '@typings/foreclosures';
import {
  BrowserCatalog,
  BrowserMarket,
  CHOICE_GROUPS,
  Filter,
  FILTERS,
  mockQuote,
  money,
  rentLabel,
} from './utils';
import './foreclosures.css';

type Phase = 'detail' | 'confirm' | 'done';
type GroupId = 'style' | 'sign' | 'lights' | 'dancers';

const CategoryIcon: React.FC<{ category: string; size?: number }> = ({ category, size = 28 }) => {
  if (category === 'nightclub') return <Music size={size} />;
  if (category === 'apartment') return <Building2 size={size} />;
  return <HomeIcon size={size} />;
};

const CATEGORY_LABEL: Record<string, string> = { nightclub: 'Nightclub', house: 'House', apartment: 'Apartment' };

const StatusPill: React.FC<{ listing: ForeclosureListing }> = ({ listing }) => {
  if (listing.status === 'yours') return <span className="mbf-pill" data-tone="yours">Yours</span>;
  if (listing.status === 'sold') return <span className="mbf-pill">Sold</span>;
  return (
    <span className="mbf-pill" data-tone="ok">
      {listing.mode === 'rent' ? 'For rent' : 'For sale'}
    </span>
  );
};

/** What a listing costs, as shown on its card: rent says how often it is due. */
const PriceText: React.FC<{ listing: ForeclosureListing }> = ({ listing }) => (
  <span className="mbf-price">
    {money(listing.price)}
    {listing.mode === 'rent' && listing.rentInterval ? <small> {rentLabel(listing.rentInterval)}</small> : null}
  </span>
);

/** The option a group starts on: the free one, which is what a new club comes with. */
const defaultOf = (options: CatalogOption[] | undefined): string | number | undefined =>
  (options?.find((o) => o.price === 0) ?? options?.[0])?.value;

export const ForeclosuresApp: React.FC = () => {
  const { addAlert } = useSnackbar();

  const [market, setMarket] = useState<ForeclosureMarket | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const [selected, setSelected] = useState<ForeclosureListing | null>(null);
  const [phase, setPhase] = useState<Phase>('detail');
  const [catalog, setCatalog] = useState<ForeclosureCatalog | null>(null);
  const [choices, setChoices] = useState<ForeclosureChoices>({});
  const [quote, setQuote] = useState<ForeclosureQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ForeclosureBuyResponse | null>(null);
  const quoteSeq = useRef(0);

  const load = useCallback(async () => {
    const next = await fetchNui<ForeclosureMarket>(ForeclosureEvents.MARKET, undefined, BrowserMarket);
    setMarket(next && Array.isArray(next.listings) ? next : { listings: [], balance: 0, account: 'bank' });
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const owned = market?.listings.find((l) => l.status === 'yours' && l.category === 'nightclub') ?? null;

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, nightclub: 0, house: 0, apartment: 0 };
    for (const l of market?.listings ?? []) {
      c.all += 1;
      if (l.category in c) c[l.category as Filter] += 1;
    }
    return c;
  }, [market]);

  const shown = useMemo(
    () => (market?.listings ?? []).filter((l) => filter === 'all' || l.category === filter),
    [market, filter],
  );

  // opening a listing: fetch what can be chosen (a nightclub's decor)
  const open = (listing: ForeclosureListing) => {
    setSelected(listing);
    setPhase('detail');
    setChoices({});
    setQuote(null);
    setQuoteError(null);
    setResult(null);
    setCatalog(null);

    if (listing.customizable && listing.status === 'available') {
      fetchNui<ForeclosureCatalog>(ForeclosureEvents.CATALOG, { key: listing.key }, BrowserCatalog)
        .then((c) => setCatalog(c && Object.keys(c).length > 0 ? c : null))
        .catch(console.error);
    }
  };

  // the price follows the choices; the server does the sums and refuses what it does not offer
  useEffect(() => {
    if (!selected || selected.status !== 'available' || phase !== 'detail') return;

    const seq = ++quoteSeq.current;
    fetchNui<ForeclosureQuoteResponse>(
      ForeclosureEvents.QUOTE,
      { key: selected.key, choices },
      mockQuote(selected, catalog, choices),
    )
      .then((res) => {
        if (seq !== quoteSeq.current) return;
        setQuote(res?.quote ?? null);
        setQuoteError(res?.error ?? null);
      })
      .catch(console.error);
  }, [selected, catalog, choices, phase]);

  const close = () => {
    setSelected(null);
    setResult(null);
    setPhase('detail');
  };

  const locate = async (listing: ForeclosureListing) => {
    if (listing.x == null || listing.y == null) {
      addAlert({ message: 'No location on file for that one.', type: 'error' });
      return;
    }
    await fetchNui(ForeclosureEvents.LOCATE, { x: listing.x, y: listing.y }, { ok: true });
    addAlert({ message: 'Waypoint set.', type: 'success' });
  };

  const buy = async () => {
    if (!selected || busy) return;
    setBusy(true);

    try {
      const res = await fetchNui<ForeclosureBuyResponse>(
        ForeclosureEvents.BUY,
        { key: selected.key, choices },
        { ok: true, message: `You now own ${selected.name}.`, balance: (market?.balance ?? 0) - (quote?.total ?? 0) },
      );
      setResult(res ?? { ok: false, message: 'No answer.' });
      setPhase('done');

      if (res?.ok) {
        setMarket((cur) => (cur && res.balance != null ? { ...cur, balance: res.balance } : cur));
        load().catch(console.error);
      }
    } finally {
      setBusy(false);
    }
  };

  // why the buy button is off, if it is
  const blocked = (() => {
    if (!selected) return null;
    if (selected.status === 'sold') return 'This one has already been sold.';
    if (selected.status === 'yours') return 'You own this.';
    if (quoteError) return quoteError;
    if (!quote) return 'Working out the price…';
    if (selected.category === 'nightclub' && owned) return `You already own ${owned.name}. A player can only own one nightclub.`;
    if ((market?.balance ?? 0) < quote.total) return `Not enough in your ${market?.account ?? 'bank'} account.`;
    return null;
  })();

  if (!market) {
    return (
      <AppWrapper id="foreclosures-app" fullBleed>
        <div className="mbf">
          <LoadingSpinner />
        </div>
      </AppWrapper>
    );
  }

  const pick = (group: GroupId, value: string | number) => setChoices((cur) => ({ ...cur, [group]: value } as ForeclosureChoices));

  const renderGroup = (id: GroupId, label: string, hint: string) => {
    const options = catalog?.[id];
    if (!options || options.length === 0) return null;
    const current = choices[id] ?? defaultOf(options);

    return (
      <div className="mbf-group" key={id}>
        <h3>{label}</h3>
        <p>{hint}</p>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            className="mbf-opt"
            aria-pressed={current === o.value}
            onClick={() => pick(id, o.value)}
          >
            <span>{o.label}</span>
            <i>{o.price === 0 ? 'Included' : `+${money(o.price)}`}</i>
          </button>
        ))}
      </div>
    );
  };

  return (
    <AppWrapper id="foreclosures-app" fullBleed>
      <div className="mbf">
        <header className="mbf-banner">
          <div className="mbf-wordmark">Maze Bank</div>
          <div className="mbf-sub">Foreclosures</div>
          <div className="mbf-account">
            <span>{market.account === 'bank' ? 'Bank account' : 'Account'}</span>
            <b>{money(market.balance)}</b>
          </div>
        </header>

        <div className="mbf-chips" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="mbf-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label} {counts[f.id] > 0 ? counts[f.id] : ''}
            </button>
          ))}
        </div>

        <div className="mbf-scroll">
          {owned && (filter === 'all' || filter === 'nightclub') && (
            <div className="mbf-note">
              You own <b>{owned.name}</b>. A player can only own one nightclub.
            </div>
          )}

          {shown.length === 0 && <div className="mbf-empty">Nothing on the market here right now.</div>}

          {shown.map((l) => (
            <button key={l.key} type="button" className="mbf-card" onClick={() => open(l)}>
              <div className="mbf-tile" data-cat={l.category}>
                <CategoryIcon category={l.category} />
              </div>
              <div className="mbf-body">
                <div className="mbf-title">{l.name}</div>
                <div className="mbf-where">{l.zone ?? CATEGORY_LABEL[l.category] ?? 'Property'}</div>
                <div className="mbf-row">
                  <PriceText listing={l} />
                  <StatusPill listing={l} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mbf-sheet">
            <div className="mbf-sheet-head">
              <button
                type="button"
                className="mbf-back"
                onClick={phase === 'confirm' ? () => setPhase('detail') : close}
              >
                <ChevronLeft size={20} /> {phase === 'confirm' ? 'Change' : phase === 'done' ? 'Done' : 'Properties'}
              </button>
            </div>

            {phase === 'detail' && (
              <>
                <div className="mbf-scroll" style={{ padding: 0 }}>
                  <div className="mbf-hero">
                    <span className="mbf-pill" data-tone={selected.status === 'available' ? 'ok' : undefined}>
                      {CATEGORY_LABEL[selected.category] ?? 'Property'}
                    </span>
                    <h2 style={{ marginTop: 8 }}>{selected.name}</h2>
                    <div className="mbf-where">{selected.zone ?? ''}</div>

                    <div className="mbf-facts">
                      <div className="mbf-fact">
                        <span>{selected.mode === 'rent' ? 'Rent' : 'Price'}</span>
                        <b>
                          {money(selected.price)}
                          {selected.mode === 'rent' && selected.rentInterval ? ` ${rentLabel(selected.rentInterval)}` : ''}
                        </b>
                      </div>
                      {selected.status === 'sold' && (
                        <div className="mbf-fact">
                          <span>Owner</span>
                          <b>{selected.ownerName ?? 'Someone'}</b>
                        </div>
                      )}
                      {selected.category === 'nightclub' && selected.incomeMax ? (
                        <>
                          <div className="mbf-fact">
                            <span>Pays</span>
                            <b>
                              {money(selected.incomeMin ?? 0)} – {money(selected.incomeMax)}
                            </b>
                          </div>
                          <div className="mbf-fact">
                            <span>Every</span>
                            <b>{selected.payoutMinutes} min of play</b>
                          </div>
                          <div className="mbf-fact">
                            <span>Safe holds</span>
                            <b>{money(selected.safeCap ?? 0)}</b>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {selected.x != null && (
                      <button type="button" className="mbf-ghost" onClick={() => locate(selected)}>
                        <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Show on map
                      </button>
                    )}
                  </div>

                  {selected.status === 'available' && catalog && (
                    <>
                      {CHOICE_GROUPS.map((g) => renderGroup(g.id, g.label, g.hint))}
                      {catalog.dryIce && (
                        <div className="mbf-group">
                          <h3>Dry ice machine</h3>
                          <p>A burst of smoke over the dance floor</p>
                          {[
                            { on: false, label: 'None', price: 0 },
                            { on: true, label: 'Dry ice machine', price: catalog.dryIce.price },
                          ].map((o) => (
                            <button
                              key={String(o.on)}
                              type="button"
                              className="mbf-opt"
                              aria-pressed={(choices.dryIce ?? false) === o.on}
                              onClick={() => setChoices((cur) => ({ ...cur, dryIce: o.on }))}
                            >
                              <span>{o.label}</span>
                              <i>{o.price === 0 ? 'Included' : `+${money(o.price)}`}</i>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selected.status === 'available' && (
                  <div className="mbf-bar">
                    {quote && quote.lines.length > 0 && (
                      <div className="mbf-lines">
                        <div>
                          <span>{selected.name}</span>
                          <span>{money(quote.base)}</span>
                        </div>
                        {quote.lines.map((l) => (
                          <div key={l.label}>
                            <span>{l.label}</span>
                            <span>+{money(l.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mbf-total">
                      <span>Total</span>
                      <b>{quote ? money(quote.total) : '—'}</b>
                    </div>
                    <button type="button" className="mbf-buy" disabled={!!blocked} onClick={() => setPhase('confirm')}>
                      {selected.mode === 'rent' ? 'Rent' : 'Buy'}
                    </button>
                    {blocked && <div className="mbf-why">{blocked}</div>}
                  </div>
                )}
              </>
            )}

            {phase === 'confirm' && quote && (
              <div className="mbf-centre">
                <div className="mbf-badge">
                  <CategoryIcon category={selected.category} size={34} />
                </div>
                <h2>Confirm</h2>
                <p>
                  {selected.mode === 'rent' ? 'Rent' : 'Buy'} <b style={{ color: '#fff' }}>{selected.name}</b> for{' '}
                  <b style={{ color: '#fff' }}>{money(quote.total)}</b>?
                </p>
                <p>It comes out of your {market.account} account.</p>
                <button type="button" className="mbf-buy" style={{ marginTop: 18 }} disabled={busy} onClick={buy}>
                  {busy ? 'Working…' : 'Confirm'}
                </button>
                <button type="button" className="mbf-ghost" disabled={busy} onClick={() => setPhase('detail')}>
                  Cancel
                </button>
              </div>
            )}

            {phase === 'done' && result && (
              <div className="mbf-centre">
                <div className="mbf-badge" data-tone={result.ok ? 'ok' : undefined}>
                  {result.ok ? <Check size={38} strokeWidth={3} /> : <X size={38} strokeWidth={3} />}
                </div>
                <h2>{result.ok ? 'Sold' : 'Not this time'}</h2>
                <p>{result.message}</p>
                {result.ok && selected.category === 'nightclub' && (
                  <p>Tony Prince will be in touch. Watch your map for his blip at the club.</p>
                )}
                {result.ok && selected.x != null && (
                  <button type="button" className="mbf-ghost" onClick={() => locate(selected)}>
                    Show on map
                  </button>
                )}
                <button type="button" className="mbf-buy" style={{ marginTop: 14 }} onClick={close}>
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppWrapper>
  );
};
