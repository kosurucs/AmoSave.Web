import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function PlaceOrderPage() {
  const [payload, setPayload] = useState('{"exchange":"NSE","tradingsymbol":"SBIN","transactionType":"BUY","quantity":1,"orderType":"MARKET","product":"MIS"}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => ordersService.placeOrder(body),
  });

  const onSubmit = () => {
    try {
      mutation.mutate(JSON.parse(payload));
    } catch {
      mutation.reset();
    }
  };

  return (
    <div className="data-grid">
      <section className="page-card form-grid">
        <h2 className="section-title">Place Order</h2>
        <textarea className="input" style={{ minHeight: 140, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Submit Order
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Place Order Result" data={mutation.data} /> : null}
    </div>
  );
}
