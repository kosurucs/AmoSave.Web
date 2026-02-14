import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function InstrumentsPage() {
  const query = useQuery({ queryKey: queryKeys.instruments, queryFn: marketService.getInstruments });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data?.length}
      emptyText="No instruments found"
    >
      <JsonView title="Market Instruments" data={query.data} />
    </AsyncState>
  );
}
