import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : '—';
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function ProfilePage() {
  const query = useQuery({ queryKey: queryKeys.userProfile, queryFn: userService.getProfile });

  const profile = toRecord(query.data);
  const exchanges = toStringList(profile.exchanges);
  const products = toStringList(profile.products);
  const orderTypes = toStringList(profile.orderTypes);

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={!query.data}
      emptyText="No profile data available"
    >
      <section className="page-card user-page-card">
        <h2 className="section-title">User Profile</h2>
        <div className="user-kv-grid">
          <div className="user-kv-item">
            <span className="helper">User ID</span>
            <strong>{toStringValue(profile.userId)}</strong>
          </div>
          <div className="user-kv-item">
            <span className="helper">User Name</span>
            <strong>{toStringValue(profile.userName)}</strong>
          </div>
          <div className="user-kv-item">
            <span className="helper">Email</span>
            <strong>{toStringValue(profile.email)}</strong>
          </div>
          <div className="user-kv-item">
            <span className="helper">User Type</span>
            <strong>{toStringValue(profile.userType)}</strong>
          </div>
          <div className="user-kv-item">
            <span className="helper">Broker</span>
            <strong>{toStringValue(profile.broker)}</strong>
          </div>
        </div>

        <div className="user-chip-block">
          <h3 className="section-title">Exchanges</h3>
          <div className="user-chip-row">
            {exchanges.length ? exchanges.map((item) => <span key={item} className="user-chip">{item}</span>) : <span className="helper">No exchanges available</span>}
          </div>
        </div>

        <div className="user-chip-block">
          <h3 className="section-title">Products</h3>
          <div className="user-chip-row">
            {products.length ? products.map((item) => <span key={item} className="user-chip">{item}</span>) : <span className="helper">No products available</span>}
          </div>
        </div>

        <div className="user-chip-block">
          <h3 className="section-title">Order Types</h3>
          <div className="user-chip-row">
            {orderTypes.length ? orderTypes.map((item) => <span key={item} className="user-chip">{item}</span>) : <span className="helper">No order types available</span>}
          </div>
        </div>
      </section>
    </AsyncState>
  );
}
