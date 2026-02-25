import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { strategyService } from '@/services/api/strategy.service';
import { Badge } from '@/shared/components/badge';
import { AsyncState } from '@/shared/components/async-state';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

function statusVariant(status: string): BadgeVariant {
  if (status === 'Active') return 'success';
  if (status === 'Paused') return 'warning';
  return 'default';
}

const QUERY_KEY = ['strategies', 'list'] as const;

export function TradeStrategiesPage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState('');

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: strategyService.getStrategies });

  const activateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      strategyService.updateStrategyStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: strategyService.deleteStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setDeleteError('');
    },
    onError: (err) => setDeleteError(mapHttpError(err)),
  });

  const strategies: Dictionary[] = query.data ?? [];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Trade Strategies
        </h2>
        <button className="btn btn-primary" style={{ fontSize: 13 }}>
          + Create New
        </button>
      </div>

      <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
        <AsyncState
          isLoading={query.isLoading}
          error={query.error ? mapHttpError(query.error) : null}
          isEmpty={strategies.length === 0}
          emptyText="No strategies yet. Build one in Strategy Builder."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Name', 'Underlying', 'Strategy Type', 'P&L', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {strategies.map((s, i) => {
                const id = String(s.id ?? i);
                const status = String(s.status ?? 'Draft');
                const pnl = typeof s.pnl === 'number' ? s.pnl : null;
                return (
                  <tr
                    key={id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text)' }}>
                      {String(s.name ?? '—')}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)' }}>
                      {String(s.underlying ?? '—')}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)' }}>
                      {String(s.strategyType ?? s.type ?? '—')}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        color:
                          pnl === null
                            ? 'var(--text-muted)'
                            : pnl >= 0
                            ? 'var(--success)'
                            : 'var(--danger)',
                        fontWeight: 600,
                      }}
                    >
                      {pnl === null ? '—' : `₹${pnl.toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Badge variant={statusVariant(status)}>{status.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          style={{ fontSize: 11, padding: '3px 10px' }}
                          onClick={() => {}}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          style={{
                            fontSize: 11,
                            padding: '3px 10px',
                            color: status === 'Active' ? 'var(--text-muted)' : 'var(--accent)',
                            borderColor: status === 'Active' ? 'var(--border)' : 'var(--accent)',
                          }}
                          disabled={activateMutation.isPending}
                          onClick={() =>
                            activateMutation.mutate({
                              id,
                              status: status === 'Active' ? 'Paused' : 'Active',
                            })
                          }
                        >
                          {status === 'Active' ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          className="btn"
                          style={{ fontSize: 11, padding: '3px 10px', color: 'var(--danger)' }}
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {deleteError && (
            <p className="error-text" style={{ padding: '8px 16px' }}>
              {deleteError}
            </p>
          )}
        </AsyncState>
      </div>
    </div>
  );
}
