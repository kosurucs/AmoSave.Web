import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function MfCancelOrderPage() {
  const [orderId, setOrderId] = useState('1');

  const mutation = useMutation({ mutationFn: () => mutualFundsService.cancelOrder(orderId) });

  return (
    <div className="data-grid">
      <section className="page-card form-grid">
        <h2 className="section-title">Cancel MF Order</h2>
        <input className="input" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Cancel MF Order
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="MF Cancel Order Result" data={mutation.data} /> : null}
    </div>
  );
}
