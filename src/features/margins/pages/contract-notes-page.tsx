import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { marginsService } from '@/services/api/margins.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function ContractNotesPage() {
  const [payload, setPayload] = useState('{"orders":[{"orderId":"230821101633675","quantity":1,"averagePrice":99.7,"exchange":"NSE","tradingSymbol":"SBIN","transactionType":"BUY","variety":"regular","orderType":"LIMIT","product":"MIS"}]}');
  const mutation = useMutation({ mutationFn: (body: Record<string, unknown>) => marginsService.contractNotes(body) });

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
        <h2 className="section-title">Virtual Contract Notes</h2>
        <textarea className="input" style={{ minHeight: 160, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Fetch Contract Notes
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Contract Notes Result" data={mutation.data} /> : null}
    </div>
  );
}
