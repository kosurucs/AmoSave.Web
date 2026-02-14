import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';

export function MarginsPage() {
  const [segment, setSegment] = useState('equity');
  const query = useQuery({ queryKey: ['user', 'margins', segment], queryFn: () => userService.getMargins(segment) });

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">User Margins</h2>
        <select className="select" value={segment} onChange={(event) => setSegment(event.target.value)}>
          <option value="equity">Equity</option>
          <option value="commodity">Commodity</option>
        </select>
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data}>
        <JsonView title="Margins Response" data={query.data} />
      </AsyncState>
    </div>
  );
}
