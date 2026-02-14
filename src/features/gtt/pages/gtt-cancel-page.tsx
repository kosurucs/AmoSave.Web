import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { JsonView } from '@/shared/components/json-view';

export function GttCancelPage() {
  const [triggerId, setTriggerId] = useState('1');

  const mutation = useMutation({ mutationFn: () => gttService.cancelTrigger(triggerId) });

  return (
    <div className="data-grid">
      <section className="page-card form-grid">
        <h2 className="section-title">Cancel GTT Trigger</h2>
        <input className="input" value={triggerId} onChange={(event) => setTriggerId(event.target.value)} />
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Cancel Trigger
        </button>
        {mutation.error ? <span className="error-text">{mapHttpError(mutation.error)}</span> : null}
      </section>
      {mutation.data ? <JsonView title="Cancel GTT Result" data={mutation.data} /> : null}
    </div>
  );
}