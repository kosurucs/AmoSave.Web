import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { optionsService } from '@/services/api/options.service';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

const UNDERLYINGS = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY'];

export function OptionsPcrPage() {
  const [underlying, setUnderlying] = useState('BANKNIFTY');
  const [expiry, setExpiry] = useState('');

  const mutation = useMutation({
    mutationFn: () => optionsService.getPcr({ underlying, expiry }),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">PCR (Put-Call Ratio)</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select className="select" value={underlying} onChange={(e) => setUnderlying(e.target.value)}>
            {UNDERLYINGS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="input" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="Expiry (e.g. 2025-01-30)" />
          <button className="btn" type="submit" disabled={!expiry || mutation.isPending}>
            {mutation.isPending ? 'Loading…' : 'Get PCR'}
          </button>
        </form>
        {mutation.isError && <p className="helper">{mapHttpError(mutation.error)}</p>}
      </section>
      {mutation.data && <JsonView title="PCR Result" data={mutation.data} />}
    </div>
  );
}
