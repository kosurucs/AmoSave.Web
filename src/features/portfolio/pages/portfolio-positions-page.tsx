import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '@/services/api/portfolio.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { queryKeys } from '@/shared/lib/query-keys';

export function PortfolioPositionsPage() {
  const query = useQuery({ queryKey: queryKeys.portfolioPositions, queryFn: portfolioService.getPositions });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data || query.data.length === 0}
      emptyText="No positions found"
    >
      <JsonView title="Portfolio Positions" data={query.data} />
    </AsyncState>
  );
}
