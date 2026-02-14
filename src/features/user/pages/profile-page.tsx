import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { JsonView } from '@/shared/components/json-view';

export function ProfilePage() {
  const query = useQuery({ queryKey: queryKeys.userProfile, queryFn: userService.getProfile });

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data}
      emptyText="No profile data available"
    >
      <JsonView title="User Profile" data={query.data} />
    </AsyncState>
  );
}
