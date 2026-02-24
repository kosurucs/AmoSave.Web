import { useQuery } from '@tanstack/react-query';
import { riskService } from '@/services/api/risk.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function RiskStatePage() {
  const query = useQuery({ queryKey: queryKeys.riskState, queryFn: riskService.getRiskState });
  return (
    <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data} emptyText="No risk state data">
      <JsonView title="Risk State" data={query.data} />
    </AsyncState>
  );
}
