import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function TriggerRangePage() {
  const [instrumentId, setInstrumentId] = useState('NSE:SBIN');
  const [transactionType, setTransactionType] = useState('BUY');

  const query = useQuery({
    queryKey: ['market', 'trigger-range', instrumentId, transactionType],
    queryFn: () => marketService.getTriggerRange({ instrumentId, transactionType }),
  });

  return (
    <div className="data-grid">
      <section className="page-card form-grid">
        <h2 className="section-title">Trigger Range</h2>
        <input className="input" value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)} />
        <select className="select" value={transactionType} onChange={(event) => setTransactionType(event.target.value)}>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data}>
        <JsonView title="Trigger Range Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
