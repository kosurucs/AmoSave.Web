import { useQuery } from '@tanstack/react-query';
import { mutualFundsService } from '@/services/api/mutual-funds.service';
import { mapHttpError } from '@/services/http/error-mapper';
import { AsyncState } from '@/shared/components/async-state';
import { queryKeys } from '@/shared/lib/query-keys';
import type { Dictionary } from '@/shared/types/api';

const INR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pctStr = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

const thS: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-elevated)',
};
const tdS: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle',
};

export function MfHoldingsPage() {
  const query = useQuery({ queryKey: queryKeys.mfHoldings, queryFn: mutualFundsService.getHoldings });
  const rows = (query.data ?? []) as Dictionary[];

  const totalInvested = rows.reduce((s, r) => s + Number(r.average_nav ?? r.averageNav ?? 0) * Number(r.quantity ?? r.units ?? 0), 0);
  const totalCurrent = rows.reduce((s, r) => s + Number(r.last_price ?? r.currentNav ?? 0) * Number(r.quantity ?? r.units ?? 0), 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const summaryCards = [
    { label: 'Total Invested',  value: INR(totalInvested), color: 'inherit' },
    { label: 'Current Value',   value: INR(totalCurrent),  color: 'inherit' },
    { label: 'Total Returns',   value: INR(totalPnl),      color: totalPnl >= 0 ? 'var(--success)' : 'var(--danger)' },
    { label: 'Overall Return%', value: pctStr(totalPnlPct), color: totalPnlPct >= 0 ? 'var(--success)' : 'var(--danger)' },
  ];

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={rows.length === 0}
      emptyText="No MF holdings found"
    >
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {summaryCards.map((c) => (
          <div key={c.label} className="page-card" style={{ padding: '16px 20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thS}>Fund Name</th>
                <th style={{ ...thS, textAlign: 'right' }}>Units</th>
                <th style={{ ...thS, textAlign: 'right' }}>Avg NAV</th>
                <th style={{ ...thS, textAlign: 'right' }}>Current NAV</th>
                <th style={{ ...thS, textAlign: 'right' }}>Value</th>
                <th style={{ ...thS, textAlign: 'right' }}>Gain / Loss</th>
                <th style={{ ...thS, textAlign: 'right' }}>Return%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const fundName = String(r.fund ?? r.tradingsymbol ?? r.scheme_name ?? '—');
                const units = Number(r.quantity ?? r.units ?? 0);
                const avgNav = Number(r.average_nav ?? r.averageNav ?? 0);
                const currentNav = Number(r.last_price ?? r.currentNav ?? r.nav ?? 0);
                const value = currentNav * units;
                const invested = avgNav * units;
                const gain = value - invested;
                const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
                const isUp = gain >= 0;
                const pnlColor = isUp ? 'var(--success)' : 'var(--danger)';

                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, maxWidth: 280 }}>{fundName}</div>
                      {r.folio != null && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Folio: {String(r.folio)}</div>}
                    </td>
                    <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{units.toFixed(3)}</td>
                    <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{INR(avgNav)}</td>
                    <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{INR(currentNav)}</td>
                    <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{INR(value)}</td>
                    <td style={{ ...tdS, textAlign: 'right', color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
                      {isUp ? '+' : ''}{INR(gain)}
                    </td>
                    <td style={{ ...tdS, textAlign: 'right', color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
                      {pctStr(gainPct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AsyncState>
  );
}
