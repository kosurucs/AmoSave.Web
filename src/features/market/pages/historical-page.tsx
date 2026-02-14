import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function HistoricalPage() {
  const [instrumentToken, setInstrumentToken] = useState('5633');

  const query = useQuery({
    queryKey: ['market', 'historical', instrumentToken],
    queryFn: () =>
      marketService.getHistorical({
        instrumentToken,
        from: '2026-01-01 09:15:00',
        to: '2026-01-01 15:30:00',
        interval: 'minute',
      }),
  });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Historical Data</h2>
        <input className="input" value={instrumentToken} onChange={(event) => setInstrumentToken(event.target.value)} />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data?.length}>
        <JsonView title="Historical Candles" data={query.data} />
      </AsyncState>
    </div>
  );
}
