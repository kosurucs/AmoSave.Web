import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function MfPlaceOrderPage() {
  const [payload, setPayload] = useState('{"tradingsymbol":"INF090I01239","transaction_type":"BUY","amount":5000,"tag":"amosave"}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => mutualFundsService.placeOrder(body),
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
        <h2 className="section-title">Place MF Order</h2>
        <textarea className="input" style={{ minHeight: 140, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Place MF Order
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="MF Place Order Result" data={mutation.data} /> : null}
    </div>
  );
}
