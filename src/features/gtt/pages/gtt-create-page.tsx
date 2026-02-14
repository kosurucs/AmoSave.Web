import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function GttCreatePage() {
  const [payload, setPayload] = useState('{"type":"single","condition":{"exchange":"NSE","tradingsymbol":"INFY","trigger_values":[1500],"last_price":1490},"orders":[{"exchange":"NSE","tradingsymbol":"INFY","transaction_type":"BUY","quantity":1,"order_type":"LIMIT","product":"CNC","price":1500}]}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => gttService.createTrigger(body),
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
        <h2 className="section-title">Create GTT Trigger</h2>
        <textarea className="input" style={{ minHeight: 160, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Create Trigger
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Create GTT Result" data={mutation.data} /> : null}
    </div>
  );
}