import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioService } from '@/services/api/portfolio.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { StatCard } from '@/shared/components/stat-card';
import { DataTable } from '@/shared/components/data-table';
import { PnlCell } from '@/shared/components/pnl-cell';
import { Badge } from '@/shared/components/badge';
import { queryKeys } from '@/shared/lib/query-keys';
import type { ColumnDef } from '@tanstack/react-table';
import type { Dictionary } from '@/shared/types/api';

type TabKey = 'day' | 'net';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'net', label: 'Net' },
];

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const productVariant: Record<string, 'warning' | 'buy' | 'default'> = {
  MIS: 'warning',
  CNC: 'buy',
  NRML: 'default',
};

const columns: ColumnDef<Dictionary>[] = [
  {
    id: 'symbol',
    header: 'Symbol',
    cell: ({ row }) => (
      <span style={{ fontWeight: 600, fontSize: 13 }}>
        {String(row.original.tradingsymbol ?? '')}
      </span>
    ),
  },
  {
    id: 'product',
    header: 'Product',
    cell: ({ row }) => {
      const p = String(row.original.product ?? '');
      return <Badge variant={productVariant[p] ?? 'default'}>{p}</Badge>;
    },
  },
  {
    id: 'qty',
    header: () => <div style={{ textAlign: 'right' }}>Qty</div>,
    cell: ({ row }) => {
      const qty = Number(row.original.quantity ?? 0);
      return (
        <div style={{ textAlign: 'right', fontWeight: 600, color: qty > 0 ? '#35d18a' : qty < 0 ? '#f06161' : 'inherit' }}>
          {qty > 0 ? `+${qty}` : qty}
        </div>
      );
    },
  },
  {
    id: 'avgCost',
    header: () => <div style={{ textAlign: 'right' }}>Avg Cost</div>,
    cell: ({ row }) => (
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {fmt(Number(row.original.averagePrice ?? 0))}
      </div>
    ),
  },
  {
    id: 'ltp',
    header: () => <div style={{ textAlign: 'right' }}>LTP</div>,
    cell: ({ row }) => (
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {fmt(Number(row.original.lastPrice ?? 0))}
      </div>
    ),
  },
  {
    id: 'dayPnl',
    header: () => <div style={{ textAlign: 'right' }}>Day P&L</div>,
    cell: ({ row }) => (
      <div style={{ textAlign: 'right' }}>
        <PnlCell value={Number(row.original.m2m ?? 0)} />
      </div>
    ),
  },
  {
    id: 'netPnl',
    header: () => <div style={{ textAlign: 'right' }}>Net P&L</div>,
    cell: ({ row }) => (
      <div style={{ textAlign: 'right' }}>
        <PnlCell value={Number(row.original.unrealised ?? 0)} />
      </div>
    ),
  },
  {
    id: 'close',
    header: '',
    cell: () => (
      <button
        style={{
          fontSize: 11,
          padding: '2px 10px',
          borderRadius: 4,
          border: '1px solid #f06161',
          background: 'transparent',
          color: '#f06161',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    ),
  },
];

export function PortfolioPositionsPage() {
  const [tab, setTab] = useState<TabKey>('day');
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.portfolioPositions, queryFn: portfolioService.getPositions });
  const all = (query.data ?? []) as Dictionary[];

  const rows = all.filter((r) =>
    tab === 'day' ? String(r.product) === 'MIS' : String(r.product) !== 'MIS'
  );

  const dayPnl = all.reduce((s, r) => s + Number(r.m2m ?? 0), 0);
  const netPnl = all.reduce((s, r) => s + Number(r.unrealised ?? 0), 0);
  const marginUsed = all.reduce(
    (s, r) => s + Math.abs(Number(r.quantity ?? 0)) * Number(r.averagePrice ?? 0),
    0,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary stat bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard
          title="Day P&L"
          value={fmt(dayPnl)}
          color={dayPnl > 0 ? 'green' : dayPnl < 0 ? 'red' : 'default'}
        />
        <StatCard
          title="Net P&L"
          value={fmt(netPnl)}
          color={netPnl > 0 ? 'green' : netPnl < 0 ? 'red' : 'default'}
        />
        <StatCard title="Total Margin Used" value={fmt(marginUsed)} />
      </div>

      {/* Main card */}
      <div className="page-card" style={{ padding: 0 }}>
        {/* Tab bar + Refresh */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                  background: 'transparent',
                  color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.portfolioPositions })}
            style={{
              fontSize: 12,
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>

        <AsyncState
          isLoading={query.isLoading}
          error={query.error ? mapHttpError(query.error) : null}
          isEmpty={!query.data || all.length === 0}
          emptyText="No positions found"
        >
          <DataTable
            columns={columns}
            data={rows}
            emptyText={tab === 'day' ? 'No intraday positions' : 'No overnight positions'}
          />
        </AsyncState>
      </div>
    </div>
  );
}
