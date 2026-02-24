import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api/dashboard.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function DashboardPage() {
  const query = useQuery({ queryKey: queryKeys.dashboardSummary, queryFn: dashboardService.getDashboardSummary });
  return (
    <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data} emptyText="No dashboard data">
      <JsonView title="Dashboard Summary" data={query.data} />
    </AsyncState>
  );
}
