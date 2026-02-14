import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { queryKeys } from '@/shared/lib/query-keys';

export function MfOrdersPage() {
  const query = useQuery({ queryKey: queryKeys.mfOrders, queryFn: mutualFundsService.getOrders });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data?.length}
      emptyText="No MF orders found"
    >
      <JsonView title="Mutual Funds Orders" data={query.data} />
    </AsyncState>
  );
}
