import { useQuery } from '@tanstack/react-query';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { queryKeys } from '@/shared/lib/query-keys';

export function GttListPage() {
  const query = useQuery({ queryKey: queryKeys.gttList, queryFn: gttService.getTriggers });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data?.length}
      emptyText="No GTT triggers found"
    >
      <JsonView title="GTT Triggers" data={query.data} />
    </AsyncState>
  );
}