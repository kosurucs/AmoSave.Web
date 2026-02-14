import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';

export function MfSipDetailPage() {
  const [sipId, setSipId] = useState('1');

  const query = useQuery({
    queryKey: ['mf', 'sips', 'detail', sipId],
    queryFn: () => mutualFundsService.getSip(sipId),
  });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">MF SIP Detail</h2>
        <input className="input" value={sipId} onChange={(event) => setSipId(event.target.value)} />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data}>
        <JsonView title="MF SIP Detail Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
