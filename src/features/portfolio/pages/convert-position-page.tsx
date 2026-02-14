import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { portfolioService } from '@/services/api/portfolio.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function ConvertPositionPage() {
  const [payload, setPayload] = useState('{"exchange":"NSE","tradingsymbol":"SBIN","transactionType":"BUY","positionType":"day","quantity":1,"oldProduct":"MIS","newProduct":"CNC"}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => portfolioService.convertPosition(body),
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
        <h2 className="section-title">Convert Position</h2>
        <textarea className="input" style={{ minHeight: 140, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Convert Position
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Convert Position Result" data={mutation.data} /> : null}
    </div>
  );
}
