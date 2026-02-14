import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function OrderHistoryPage() {
  const [orderId, setOrderId] = useState('1234');
  const query = useQuery({ queryKey: ['orders', 'history', orderId], queryFn: () => ordersService.getOrderHistory(orderId) });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Order History</h2>
        <input className="input" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data?.length}>
        <JsonView title="Order History Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
