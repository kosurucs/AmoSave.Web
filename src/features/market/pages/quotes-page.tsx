import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function QuotesPage() {
  const [symbolsText, setSymbolsText] = useState('NSE:INFY,NSE:SBIN');
  const symbols = symbolsText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const quoteQuery = useQuery({ queryKey: ['market', 'quote', symbols], queryFn: () => marketService.getQuotes(symbols) });
  const ohlcQuery = useQuery({ queryKey: ['market', 'ohlc', symbols], queryFn: () => marketService.getOHLC(symbols) });
  const ltpQuery = useQuery({ queryKey: ['market', 'ltp', symbols], queryFn: () => marketService.getLTP(symbols) });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Quote / OHLC / LTP</h2>
        <input className="input" value={symbolsText} onChange={(event) => setSymbolsText(event.target.value)} />
      </section>
      <AsyncState isLoading={quoteQuery.isLoading} error={quoteQuery.error ? mapHttpError(quoteQuery.error) : null} isEmpty={!quoteQuery.data}>
        <JsonView title="Quotes" data={quoteQuery.data} />
      </AsyncState>
      <AsyncState isLoading={ohlcQuery.isLoading} error={ohlcQuery.error ? mapHttpError(ohlcQuery.error) : null} isEmpty={!ohlcQuery.data}>
        <JsonView title="OHLC" data={ohlcQuery.data} />
      </AsyncState>
      <AsyncState isLoading={ltpQuery.isLoading} error={ltpQuery.error ? mapHttpError(ltpQuery.error) : null} isEmpty={!ltpQuery.data}>
        <JsonView title="LTP" data={ltpQuery.data} />
      </AsyncState>
    </div>
  );
}
