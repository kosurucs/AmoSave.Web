import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';

export function GttDetailPage() {
  const [triggerId, setTriggerId] = useState('1');

  const query = useQuery({
    queryKey: ['gtt', 'detail', triggerId],
    queryFn: () => gttService.getTrigger(triggerId),
  });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">GTT Detail</h2>
        <input className="input" value={triggerId} onChange={(event) => setTriggerId(event.target.value)} />
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data}>
        <JsonView title="GTT Detail Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
