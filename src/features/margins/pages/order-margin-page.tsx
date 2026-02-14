import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { marginsService } from '@/services/api/margins.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function OrderMarginPage() {
  const [payload, setPayload] = useState('{"orders":[{"exchange":"NSE","tradingsymbol":"SBIN","transactionType":"BUY","quantity":1,"orderType":"MARKET","product":"MIS"}]}');
  const mutation = useMutation({ mutationFn: (body: Record<string, unknown>) => marginsService.orderMargins(body) });

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
        <h2 className="section-title">Order Margin Preview</h2>
        <textarea className="input" style={{ minHeight: 140, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Calculate Order Margin
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Order Margin Result" data={mutation.data} /> : null}
    </div>
  );
}
