import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';

export function MfOrderDetailPage() {
  const [orderId, setOrderId] = useState('1');

  const query = useQuery({
    queryKey: ['mf', 'orders', 'detail', orderId],
    queryFn: () => mutualFundsService.getOrder(orderId),
  });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">MF Order Detail</h2>
        <input className="input" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data}>
        <JsonView title="MF Order Detail Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
