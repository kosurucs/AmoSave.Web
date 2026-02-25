import { useQuery } from '@tanstack/react-query';
import { riskService } from '@/services/api/risk.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { StatCard } from '@/shared/components/stat-card';
import { Badge } from '@/shared/components/badge';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (Math.abs(value) / Math.abs(max)) * 100) : 0;
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 999,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

export function RiskStatePage() {
  const query = useQuery({
    queryKey: queryKeys.riskState,
    queryFn: riskService.getRiskState,
    refetchInterval: 30_000,
  });

  const state = query.data;

  const dailyPnl = typeof state?.dailyPnl === 'number' ? state.dailyPnl : 0;
  const marginUsed = typeof state?.marginUsed === 'number' ? state.marginUsed : 0;
  const marginLimit = typeof state?.marginLimit === 'number' ? state.marginLimit : 100;
  const maxDailyLoss = typeof state?.maxDailyLoss === 'number' ? state.maxDailyLoss : 0;
  const openPositions = typeof state?.openPositions === 'number' ? state.openPositions : 0;
  const riskScore = typeof state?.riskScore === 'number' ? state.riskScore : null;
  const capitalAtRisk = typeof state?.capitalAtRisk === 'number' ? state.capitalAtRisk : 0;
  const isHalted = state?.isHalted === true || String(state?.status ?? '').toUpperCase() === 'HALTED';
  const positions: Dictionary[] = Array.isArray(state?.positions) ? (state!.positions as Dictionary[]) : [];

  const marginPct = marginLimit > 0 ? Math.min(100, (marginUsed / marginLimit) * 100) : 0;
  const lossPct = maxDailyLoss > 0 ? Math.min(100, (Math.abs(dailyPnl < 0 ? dailyPnl : 0) / maxDailyLoss) * 100) : 0;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Risk Dashboard</h2>
        <Badge variant={isHalted ? 'danger' : 'success'}>{isHalted ? 'HALTED' : 'ACTIVE'}</Badge>
      </div>

      <AsyncState
        isLoading={query.isLoading}
        error={query.error ? mapHttpError(query.error) : null}
        isEmpty={!state}
        emptyText="No risk state data available."
      >
        {/* Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <StatCard
            title="Current Day P&L"
            value={`\u20b9${dailyPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color={dailyPnl > 0 ? 'green' : dailyPnl < 0 ? 'red' : 'default'}
          />
          <StatCard
            title="Margin Used"
            value={`\u20b9${marginUsed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            sub={`of \u20b9${marginLimit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            color={marginPct > 80 ? 'red' : 'default'}
          />
          <StatCard title="Open Positions" value={openPositions} />
          <StatCard
            title="Risk Score"
            value={riskScore != null ? `${riskScore}/100` : 'N/A'}
            color={riskScore != null && riskScore > 70 ? 'red' : riskScore != null && riskScore > 40 ? 'default' : 'green'}
          />
        </div>

        {/* Progress Bars */}
        <div className="page-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}
            >
              <span>Margin Used</span>
              <span style={{ fontWeight: 600, color: marginPct > 80 ? 'var(--danger)' : 'var(--text)' }}>
                {marginPct.toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              value={marginUsed}
              max={marginLimit}
              color={marginPct > 80 ? 'var(--danger)' : marginPct > 60 ? '#f4c94a' : 'var(--success)'}
            />
          </div>
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}
            >
              <span>Day Loss vs Max Loss Limit</span>
              <span style={{ fontWeight: 600, color: lossPct > 80 ? 'var(--danger)' : 'var(--text)' }}>
                {lossPct.toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              value={Math.abs(dailyPnl < 0 ? dailyPnl : 0)}
              max={maxDailyLoss}
              color={lossPct > 80 ? 'var(--danger)' : lossPct > 50 ? '#f4c94a' : 'var(--success)'}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Capital at Risk: <strong style={{ color: 'var(--text)' }}>\u20b9{capitalAtRisk.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Positions Table */}
        {positions.length > 0 && (
          <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
              Open Positions — Risk Metrics
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {['Symbol', 'Side', 'Qty', 'Avg Price', 'LTP', 'P&L', 'Risk %'].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 11 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => {
                  const pnl = typeof p.pnl === 'number' ? p.pnl : null;
                  const riskPct = typeof p.riskPct === 'number' ? p.riskPct : null;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text)' }}>
                        {String(p.symbol ?? p.tradingsymbol ?? '—')}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <Badge variant={String(p.side ?? p.transactionType ?? '') === 'BUY' ? 'buy' : 'sell'}>
                          {String(p.side ?? p.transactionType ?? '—')}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{String(p.quantity ?? p.qty ?? '—')}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text)' }}>
                        {typeof p.averagePrice === 'number' ? `\u20b9${p.averagePrice.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text)' }}>
                        {typeof p.ltp === 'number' ? `\u20b9${p.ltp.toFixed(2)}` : '—'}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          fontWeight: 600,
                          color: pnl === null ? 'var(--text-muted)' : pnl >= 0 ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {pnl === null ? '—' : `${pnl >= 0 ? '+' : ''}\u20b9${pnl.toFixed(2)}`}
                      </td>
                      <td
                        style={{
                          padding: '8px 12px',
                          color: riskPct != null && riskPct > 5 ? 'var(--danger)' : 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {riskPct != null ? `${riskPct.toFixed(2)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
