import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { ordersService } from '@/services/api/orders.service';
import { AsyncState } from '@/shared/components/async-state';
import { DataTable } from '@/shared/components/data-table';
import { Badge } from '@/shared/components/badge';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

const columns: ColumnDef<Dictionary>[] = [
  { header: 'Timestamp', accessorKey: 'timestamp' },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const v = String(getValue() ?? '');
      const variant =
        v === 'COMPLETE' ? 'success'
        : v === 'REJECTED' ? 'danger'
        : v === 'CANCELLED' ? 'warning'
        : 'default';
      return <Badge variant={variant}>{v}</Badge>;
    },
  },
  { header: 'Message', accessorKey: 'message' },
  { header: 'Qty', accessorKey: 'quantity' },
  { header: 'Price', accessorKey: 'price' },
];

export function OrderHistoryPage() {
  const [input, setInput] = useState('');
  const [orderId, setOrderId] = useState('');

  const query = useQuery({
    queryKey: ['orders', 'history', orderId],
    queryFn: () => ordersService.getOrderHistory(orderId),
    enabled: orderId.trim().length > 0,
  });

  const onFetch = () => setOrderId(input.trim());

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Order History</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Enter Order ID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFetch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={onFetch} disabled={!input.trim()}>
            Fetch History
          </button>
        </div>

        {orderId ? (
          <AsyncState
            isLoading={query.isLoading}
            error={query.error ? mapHttpError(query.error) : null}
            isEmpty={!query.data?.length}
            emptyText="No history found for this order"
          >
            <DataTable columns={columns} data={query.data ?? []} emptyText="No history found" />
          </AsyncState>
        ) : (
          <p className="helper">Enter an Order ID and click "Fetch History".</p>
        )}
      </section>
    </div>
  );
}
