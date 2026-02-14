import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { queryKeys } from '@/shared/lib/query-keys';

export function MfSipsPage() {
  const query = useQuery({ queryKey: queryKeys.mfSips, queryFn: mutualFundsService.getSips });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data?.length}
      emptyText="No SIPs found"
    >
      <JsonView title="Mutual Funds SIPs" data={query.data} />
    </AsyncState>
  );
}
