import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { optionsService } from '@/services/api/options.service';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

const UNDERLYINGS = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY'];

export function OptionsChainPage() {
  const [underlying, setUnderlying] = useState('BANKNIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('');

  const expiriesQuery = useQuery({
    queryKey: ['options', 'expiries', underlying],
    queryFn: () => optionsService.getExpiries(underlying),
  });

  const chainMutation = useMutation({
    mutationFn: (expiry: string) =>
      optionsService.getOptionChain({ userId: '', underlying, expiry }),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (selectedExpiry) chainMutation.mutate(selectedExpiry);
  }

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Option Chain</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select className="select" value={underlying} onChange={(e) => { setUnderlying(e.target.value); setSelectedExpiry(''); }}>
            {UNDERLYINGS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <AsyncState isLoading={expiriesQuery.isLoading} error={expiriesQuery.error ? mapHttpError(expiriesQuery.error) : null} isEmpty={false}>
            <select className="select" value={selectedExpiry} onChange={(e) => setSelectedExpiry(e.target.value)}>
              <option value="">Select expiry</option>
              {(expiriesQuery.data ?? []).map((exp) => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </AsyncState>
          <button className="btn" type="submit" disabled={!selectedExpiry || chainMutation.isPending}>
            {chainMutation.isPending ? 'Loading…' : 'Fetch Chain'}
          </button>
        </form>
      </section>
      {chainMutation.isError && (
        <section className="page-card">
          <p className="helper">{mapHttpError(chainMutation.error)}</p>
        </section>
      )}
      {chainMutation.data && <JsonView title="Option Chain" data={chainMutation.data} />}
    </div>
  );
}
