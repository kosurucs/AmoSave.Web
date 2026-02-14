import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function MfModifySipPage() {
  const [sipId, setSipId] = useState('1');
  const [payload, setPayload] = useState('{"amount":2500,"instalments":8}');

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => mutualFundsService.modifySip(sipId, body),
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
        <h2 className="section-title">Modify MF SIP</h2>
        <input className="input" value={sipId} onChange={(event) => setSipId(event.target.value)} />
        <textarea className="input" style={{ minHeight: 120, paddingTop: 10 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn btn-primary" onClick={onSubmit} disabled={mutation.isPending}>
          Modify SIP
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="MF Modify SIP Result" data={mutation.data} /> : null}
    </div>
  );
}
