import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { Badge } from '@/shared/components/badge';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Dictionary } from '@/shared/types/api';

type BadgeVariant = 'default' | 'buy' | 'sell' | 'success' | 'danger' | 'warning';

const INR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type TabKey = 'all' | 'pending' | 'executed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'executed',  label: 'Executed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function statusVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'executed' || s === 'allotted') return 'success';
  if (s === 'cancelled' || s === 'rejected')                      return 'danger';
  if (s === 'pending' || s === 'open')                            return 'warning';
  return 'default';
}

const thS: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-elevated)',
};
const tdS: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle',
};

export function MfOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const query = useQuery({ queryKey: queryKeys.mfOrders, queryFn: mutualFundsService.getOrders });
  const rows = (query.data ?? []) as Dictionary[];

  const filtered = useMemo(() => {
    if (activeTab === 'all') return rows;
    return rows.filter((r) => {
      const s = String(r.status ?? '').toLowerCase();
      if (activeTab === 'pending')   return s === 'pending' || s === 'open';
      if (activeTab === 'executed')  return s === 'confirmed' || s === 'executed' || s === 'allotted';
      if (activeTab === 'cancelled') return s === 'cancelled' || s === 'rejected';
      return true;
    });
  }, [rows, activeTab]);

  const counts = useMemo(() => ({
    all:       rows.length,
    pending:   rows.filter((r) => { const s = String(r.status ?? '').toLowerCase(); return s === 'pending' || s === 'open'; }).length,
    executed:  rows.filter((r) => { const s = String(r.status ?? '').toLowerCase(); return s === 'confirmed' || s === 'executed' || s === 'allotted'; }).length,
    cancelled: rows.filter((r) => { const s = String(r.status ?? '').toLowerCase(); return s === 'cancelled' || s === 'rejected'; }).length,
  }), [rows]);

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px', fontSize: 13, fontWeight: active ? 600 : 400,
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: 6, fontSize: 11, padding: '1px 6px', borderRadius: 10,
                background: active ? 'rgba(var(--accent-rgb),0.15)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <AsyncState
        isLoading={query.isLoading}
        error={query.error ? mapHttpError(query.error) : null}
        isEmpty={filtered.length === 0}
        emptyText="No orders found"
      >
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Date</th>
                  <th style={thS}>Fund Name</th>
                  <th style={thS}>Type</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Amount / Units</th>
                  <th style={{ ...thS, textAlign: 'right' }}>NAV</th>
                  <th style={thS}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const fundName = String(r.fund ?? r.tradingsymbol ?? r.scheme_name ?? '—');
                  const type = String(r.transaction_type ?? r.order_type ?? '—').toUpperCase();
                  const isBuy = type.includes('BUY') || type.includes('PURCHASE');
                  const amount = Number(r.amount ?? 0);
                  const units = Number(r.quantity ?? r.units ?? 0);
                  const nav = Number(r.price ?? r.nav ?? 0);
                  const status = String(r.status ?? '—');
                  const date = r.order_timestamp ?? r.created_at;
                  const dateStr = date ? new Date(String(date)).toLocaleDateString('en-IN') : '—';

                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{dateStr}</td>
                      <td style={tdS}>
                        <div style={{ fontWeight: 600, maxWidth: 280 }}>{fundName}</div>
                      {r.order_id != null && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>#{String(r.order_id)}</div>}
                      </td>
                      <td style={tdS}>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: isBuy ? 'rgba(53,209,138,0.12)' : 'rgba(240,97,97,0.12)',
                          color: isBuy ? 'var(--success)' : 'var(--danger)',
                        }}>
                          {type}
                        </span>
                      </td>
                      <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {amount > 0 ? INR(amount) : '—'}
                        {units > 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{units.toFixed(3)} units</div>}
                      </td>
                      <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {nav > 0 ? INR(nav) : '—'}
                      </td>
                      <td style={tdS}>
                        <Badge variant={statusVariant(status)}>{status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AsyncState>
    </div>
  );
}
