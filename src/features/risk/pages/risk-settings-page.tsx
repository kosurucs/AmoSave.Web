import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskService } from '@/services/api/risk.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function RiskSettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.riskSettings, queryFn: riskService.getRiskSettings });
  const mutation = useMutation({
    mutationFn: riskService.updateRiskSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.riskSettings }),
  });

  return (
    <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data} emptyText="No risk settings">
      <JsonView title="Risk Settings" data={query.data} />
      {mutation.isSuccess && <p className="helper">Settings updated.</p>}
    </AsyncState>
  );
}
