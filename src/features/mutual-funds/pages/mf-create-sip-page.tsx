import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function MfCreateSipPage() {
  const [payload, setPayload] = useState('{"tradingsymbol":"INF090I01239","amount":2000,"frequency":"monthly","initial_amount":2000,"instalments":6}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => mutualFundsService.createSip(body),
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
        <h2 className="section-title">Create MF SIP</h2>
        <textarea className="input" style={{ minHeight: 140, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Create SIP
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="MF Create SIP Result" data={mutation.data} /> : null}
    </div>
  );
}
