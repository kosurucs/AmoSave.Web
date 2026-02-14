import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '@/services/api/portfolio.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function PortfolioHoldingsPage() {
  const query = useQuery({ queryKey: queryKeys.portfolioHoldings, queryFn: portfolioService.getHoldings });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data || query.data.length === 0}
      emptyText="No holdings found"
    >
      <JsonView title="Portfolio Holdings" data={query.data} />
    </AsyncState>
  );
}
