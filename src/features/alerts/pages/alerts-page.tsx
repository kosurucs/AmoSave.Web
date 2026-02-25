import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services/api/alerts.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { Badge } from '@/shared/components/badge';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

type BadgeVariant = 'success' | 'warning' | 'default';

const CONDITIONS = [
  { value: 'PRICE_ABOVE', label: 'Above' },
  { value: 'PRICE_BELOW', label: 'Below' },
  { value: 'CHANGE_PCT_ABOVE', label: 'Change % Above' },
  { value: 'CHANGE_PCT_BELOW', label: 'Change % Below' },
];

function statusVariant(status: string): BadgeVariant {
  if (status === 'active') return 'success';
  if (status === 'triggered') return 'warning';
  return 'default';
}

export function AlertsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('PRICE_ABOVE');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');

  const query = useQuery({ queryKey: queryKeys.alerts, queryFn: alertsService.getAlerts });

  const createMutation = useMutation({
    mutationFn: alertsService.createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
      setSymbol('');
      setCondition('PRICE_ABOVE');
      setPrice('');
      setFormError('');
      setShowModal(false);
    },
    onError: (err) => setFormError(mapHttpError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: alertsService.deleteAlert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ symbol, condition, value: Number(price) });
  }

  const alerts: Dictionary[] = query.data ?? [];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Alerts</h2>
        <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setShowModal(true)}>
          + Create Alert
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="page-card"
            style={{ width: 420, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Create Alert
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                Symbol
                <input
                  className="input"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="NSE:RELIANCE"
                  required
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                Condition
                <select
                  className="select"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                Target Price (₹)
                <input
                  className="input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  required
                />
              </label>
              {formError && <p className="error-text" style={{ margin: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
        <AsyncState
          isLoading={query.isLoading}
          error={query.error ? mapHttpError(query.error) : null}
          isEmpty={alerts.length === 0}
          emptyText="No alerts configured. Create your first alert above."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Symbol', 'Condition', 'Target Price', 'Current Price', 'Status', 'Actions'].map((h) => (
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
              {alerts.map((a, i) => {
                const id = String(a.id ?? i);
                const cond = String(a.condition ?? '');
                const condLabel = CONDITIONS.find((c) => c.value === cond)?.label ?? cond;
                const status = String(a.status ?? 'inactive');
                const targetPrice = typeof a.value === 'number' ? a.value : parseFloat(String(a.value ?? ''));
                const currentPrice = typeof a.currentPrice === 'number' ? a.currentPrice : null;
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text)' }}>
                      {String(a.symbol ?? '—')}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)' }}>{condLabel}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)', fontWeight: 600 }}>
                      {isNaN(targetPrice) ? '—' : `₹${targetPrice.toLocaleString('en-IN')}`}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                      {currentPrice != null ? `₹${currentPrice.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Badge variant={statusVariant(status)}>{status.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        className="btn"
                        style={{ fontSize: 11, padding: '3px 10px', color: 'var(--danger)' }}
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AsyncState>
      </div>
    </div>
  );
}
