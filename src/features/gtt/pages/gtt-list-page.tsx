import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Dictionary } from '@/shared/types/api';

const INR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type GttStatus = 'active' | 'triggered' | 'cancelled' | 'rejected' | string;

function StatusBadge({ status }: { status: GttStatus }) {
  const s = String(status ?? '').toLowerCase();
  const styles: Record<string, { bg: string; color: string }> = {
    active:    { bg: 'rgba(53,209,138,0.15)',  color: 'var(--success)' },
    triggered: { bg: 'rgba(99,162,255,0.15)',  color: '#63a2ff' },
    cancelled: { bg: 'rgba(160,160,170,0.12)', color: 'var(--text-muted)' },
    rejected:  { bg: 'rgba(240,97,97,0.15)',   color: 'var(--danger)' },
  };
  const style = styles[s] ?? styles.cancelled;
  return (
    <span style={{ borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, ...style }}>
      {String(status ?? '—').toUpperCase()}
    </span>
  );
}

const thS: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-elevated)',
};
const tdS: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle',
};

export function GttListPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.gttList, queryFn: gttService.getTriggers });
  const rows = (query.data ?? []) as Dictionary[];

  const cancel = useMutation({
    mutationFn: (id: string) => gttService.cancelTrigger(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.gttList }),
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>GTT Orders</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Good Till Triggered — set-and-forget order automation
          </div>
        </div>
        <Link
          to="/app/gtt/create"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: '#fff',
            padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + Create GTT
        </Link>
      </div>

      <AsyncState
        isLoading={query.isLoading}
        error={query.error ? mapHttpError(query.error) : null}
        isEmpty={rows.length === 0}
        emptyText="No GTT triggers found"
      >
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Symbol</th>
                  <th style={thS}>Trigger Type</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Trigger Price</th>
                  <th style={{ ...thS, textAlign: 'right' }}>LTP</th>
                  <th style={thS}>Status</th>
                  <th style={thS}>Created</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const id = String(r.id ?? r.trigger_id ?? i);
                  const condition = (r.condition ?? {}) as Dictionary;
                  const symbol = String(r.tradingsymbol ?? condition.tradingsymbol ?? '—');
                  const exchange = String(r.exchange ?? condition.exchange ?? '');
                  const type = String(r.type ?? '—').toUpperCase();
                  const triggerVals = condition.trigger_values;
                  const triggerPrice = Array.isArray(triggerVals)
                    ? triggerVals.map((v) => INR(Number(v))).join(' / ')
                    : INR(Number(triggerVals ?? 0));
                  const ltp = Number(condition.last_price ?? r.lastPrice ?? 0);
                  const status = String(r.status ?? 'active');
                  const created = r.created_at ? new Date(String(r.created_at)).toLocaleDateString('en-IN') : '—';
                  const canCancel = status.toLowerCase() === 'active';

                  return (
                    <tr key={id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={tdS}>
                        <div style={{ fontWeight: 600 }}>{symbol}</div>
                        {exchange && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{exchange}</div>}
                      </td>
                      <td style={tdS}>
                        <span style={{ fontSize: 12, background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>
                          {type}
                        </span>
                      </td>
                      <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{triggerPrice}</td>
                      <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {ltp > 0 ? INR(ltp) : '—'}
                      </td>
                      <td style={tdS}><StatusBadge status={status} /></td>
                      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{created}</td>
                      <td style={{ ...tdS, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <Link
                            to={`/app/gtt/${id}`}
                            style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                          >
                            View
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => cancel.mutate(id)}
                              disabled={cancel.isPending}
                              style={{
                                fontSize: 12, color: 'var(--danger)', background: 'none',
                                border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500,
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {cancel.isError && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>
            {mapHttpError(cancel.error)}
          </p>
        )}
      </AsyncState>
    </div>
  );
}