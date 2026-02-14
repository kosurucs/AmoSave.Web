import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function TradesPage() {
  const [orderId, setOrderId] = useState('');
  const query = useQuery({
    queryKey: ['orders', 'trades', orderId],
    queryFn: () => ordersService.getTrades(orderId || undefined),
  });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Trades</h2>
        <input
          className="input"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="Optional order id"
        />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data?.length}>
        <JsonView title="Trades Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
