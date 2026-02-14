import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function MfCancelSipPage() {
  const [sipId, setSipId] = useState('1');

  const mutation = useMutation({ mutationFn: () => mutualFundsService.cancelSip(sipId) });

  return (
    <div className="data-grid">
      <section className="page-card form-grid">
        <h2 className="section-title">Cancel MF SIP</h2>
        <input className="input" value={sipId} onChange={(event) => setSipId(event.target.value)} />
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Cancel SIP
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="MF Cancel SIP Result" data={mutation.data} /> : null}
    </div>
  );
}
