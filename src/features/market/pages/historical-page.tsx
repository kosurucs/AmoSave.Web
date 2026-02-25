import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { marketService } from '@/services/api/market.service';
import { DataTable } from '@/shared/components/data-table';
import { AsyncState } from '@/shared/components/async-state';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

const INTERVALS = [
  { value: 'minute', label: '1 Minute' },
  { value: '3minute', label: '3 Minutes' },
  { value: '5minute', label: '5 Minutes' },
  { value: '10minute', label: '10 Minutes' },
  { value: '15minute', label: '15 Minutes' },
  { value: '30minute', label: '30 Minutes' },
  { value: '60minute', label: '60 Minutes' },
  { value: 'day', label: 'Day' },
];

function fmt2(n: unknown) {
  const v = typeof n === 'number' ? n : Number(n ?? 0);
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const columns: ColumnDef<Dictionary>[] = [
  {
    header: 'Date',
    accessorKey: 'date',
    cell: (info) => {
      const v = info.getValue();
      if (!v) return '—';
      try {
        return new Date(String(v)).toLocaleString('en-IN');
      } catch {
        return String(v);
      }
    },
  },
  {
    header: 'Open',
    accessorKey: 'open',
    cell: (info) => `₹${fmt2(info.getValue())}`,
  },
  {
    header: 'High',
    accessorKey: 'high',
    cell: (info) => (
      <span style={{ color: '#35d18a' }}>₹{fmt2(info.getValue())}</span>
    ),
  },
  {
    header: 'Low',
    accessorKey: 'low',
    cell: (info) => (
      <span style={{ color: '#f06161' }}>₹{fmt2(info.getValue())}</span>
    ),
  },
  {
    header: 'Close',
    accessorKey: 'close',
    cell: (info) => {
      const close = typeof info.getValue() === 'number' ? (info.getValue() as number) : Number(info.getValue() ?? 0);
      const open = typeof info.row.original.open === 'number' ? info.row.original.open : Number(info.row.original.open ?? 0);
      const color = close >= open ? '#35d18a' : '#f06161';
      return <span style={{ color }}>₹{fmt2(close)}</span>;
    },
  },
  {
    header: 'Volume',
    accessorKey: 'volume',
    cell: (info) => {
      const v = info.getValue();
      return typeof v === 'number' ? v.toLocaleString('en-IN') : String(v ?? '—');
    },
  },
];

export function HistoricalPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

  const [instrumentToken, setInstrumentToken] = useState('5633');
  const [interval, setInterval] = useState('day');
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [fetchParams, setFetchParams] = useState<Dictionary | null>(null);

  const query = useQuery({
    queryKey: ['market', 'historical-manual', fetchParams],
    queryFn: () => marketService.getHistorical(fetchParams!),
    enabled: fetchParams !== null,
  });

  function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setFetchParams({
      instrumentToken,
      interval,
      from: `${from} 09:15:00`,
      to: `${to} 15:30:00`,
    });
  }

  const candles = (query.data ?? []) as Dictionary[];

  return (
    <div>
      <section className="page-card" style={{ marginBottom: 20 }}>
        <h2 className="section-title">Historical Data</h2>
        <form onSubmit={handleFetch}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              Instrument Token
              <input
                className="input"
                value={instrumentToken}
                onChange={(e) => setInstrumentToken(e.target.value)}
                placeholder="5633"
                required
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              Interval
              <select
                className="select"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                {INTERVALS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              From
              <input
                className="input"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              To
              <input
                className="input"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </label>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={query.isFetching}
              style={{ alignSelf: 'flex-end' }}
            >
              {query.isFetching ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          {query.isError && (
            <p className="error-text" style={{ marginTop: 8 }}>
              {mapHttpError(query.error)}
            </p>
          )}
        </form>
      </section>

      {fetchParams !== null && (
        <section className="page-card">
          <h2 className="section-title">
            Candles{' '}
            {candles.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                ({candles.length} rows)
              </span>
            )}
          </h2>
          <AsyncState
            isLoading={query.isLoading}
            error={query.error ? mapHttpError(query.error) : null}
            isEmpty={candles.length === 0}
            emptyText="No candles returned."
          >
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              <DataTable columns={columns} data={candles} emptyText="No data." />
            </div>
          </AsyncState>
        </section>
      )}
    </div>
  );
}
