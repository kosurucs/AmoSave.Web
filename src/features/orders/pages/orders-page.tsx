import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';
import { mapHttpError } from '@/services/http/error-mapper';

export function OrdersPage() {
  const query = useQuery({ queryKey: queryKeys.orders, queryFn: ordersService.getOrders });

  return (
    <AsyncState isLoading={query.isLoading} error={query.error ? mapHttpError(query.error) : null} isEmpty={!query.data?.length}>
      <JsonView title="Orders List" data={query.data} />
    </AsyncState>
  );
}
