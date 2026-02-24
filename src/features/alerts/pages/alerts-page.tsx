import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services/api/alerts.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function AlertsPage() {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');

  const query = useQuery({ queryKey: queryKeys.alerts, queryFn: alertsService.getAlerts });

  const createMutation = useMutation({
    mutationFn: alertsService.createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
      setSymbol('');
      setPrice('');
    },
  });

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    createMutation.mutate({ symbol, price: Number(price) });
  }

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title">Create Alert</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol (e.g. NSE:RELIANCE)" />
          <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" />
          <button className="btn" type="submit" disabled={!symbol || !price || createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createMutation.isError && <p className="helper">{mapHttpError(createMutation.error)}</p>}
      </section>
      <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data?.length} emptyText="No alerts">
        <JsonView title="Alerts" data={query.data} />
      </AsyncState>
    </div>
  );
}
