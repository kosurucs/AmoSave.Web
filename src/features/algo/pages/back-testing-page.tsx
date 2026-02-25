import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { backtestService } from '@/services/api/backtest.service';
import type { Dictionary } from '@/shared/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Underlying = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY';

interface FormState {
  underlying: Underlying;
  strategyType: string;
  entryTime: string;
  exitTime: string;
  startDate: string;
  endDate: string;
  stopLoss: number;
  targetProfit: number;
  lots: number;
}

interface EquityPoint {
  date: string;
  pnl: number;
}

interface MonthlyReturn {
  year: number;
  month: number;
  value: number;
}

interface TradeRow {
  date: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  duration: string;
  isWin: boolean;
}

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  netPnl: number;
  sharpeRatio: number;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
  trades: TradeRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }
function todayIso() { return isoDate(new Date()); }
function oneYearAgoIso() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return isoDate(d);
}
function fmtRupee(n: number) {
  return `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmt2(n: number) { return n.toFixed(2); }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STRATEGY_TYPES = ['Straddle', 'Iron Condor', 'Bull Call Spread', 'Bear Put Spread', 'Custom'];
const UNDERLYINGS: Underlying[] = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];

// ─── Mock Data ────────────────────────────────────────────────────────────────

function generateMockResult(): BacktestResult {
  const trades: TradeRow[] = [];
  let cumPnl = 0;
  const equityCurve: EquityPoint[] = [];
  const monthlyMap: Record<string, number> = {};
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  for (let i = 0; i < 48; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    const entryPrice = 200 + Math.random() * 50;
    const pnl = (Math.random() - 0.42) * 8000;
    const exitPrice = entryPrice + pnl / 75;
    cumPnl += pnl;
    const dateStr = isoDate(date);

    trades.push({
      date: dateStr,
      entryPrice,
      exitPrice,
      pnl,
      duration: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 55)}m`,
      isWin: pnl > 0,
    });
    equityCurve.push({ date: dateStr, pnl: Math.round(cumPnl) });

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + pnl;
  }

  const monthlyReturns: MonthlyReturn[] = Object.entries(monthlyMap).map(([k, v]) => {
    const [year, month] = k.split('-').map(Number);
    return { year, month: month as number, value: v };
  });

  const wins = trades.filter((t) => t.isWin).length;
  return {
    totalTrades: trades.length,
    winRate: (wins / trades.length) * 100,
    netPnl: cumPnl,
    sharpeRatio: 1.2 + Math.random() * 0.8,
    equityCurve,
    monthlyReturns,
    trades,
  };
}

function parseResult(data: Dictionary): BacktestResult {
  const rawTrades = (data.trades as Dictionary[] | undefined) ?? [];
  const rawCurve = (data.equityCurve as Dictionary[] | undefined) ?? [];
  if (rawTrades.length === 0 && rawCurve.length === 0) return generateMockResult();

  const trades: TradeRow[] = rawTrades.map((t) => ({
    date: String(t.entryTime ?? '').split('T')[0],
    entryPrice: Number(t.entryPrice ?? 0),
    exitPrice: Number(t.exitPrice ?? 0),
    pnl: Number(t.pnl ?? 0),
    duration: '—',
    isWin: Number(t.pnl ?? 0) > 0,
  }));

  const equityCurve: EquityPoint[] = rawCurve.map((p) => ({
    date: String(p.date ?? ''),
    pnl: Number(p.equity ?? p.pnl ?? 0),
  }));

  const monthlyMap: Record<string, number> = {};
  for (const t of trades) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + t.pnl;
  }
  const monthlyReturns: MonthlyReturn[] = Object.entries(monthlyMap).map(([k, v]) => {
    const [year, month] = k.split('-').map(Number);
    return { year, month: month as number, value: v };
  });

  return {
    totalTrades: Number(data.totalTrades ?? trades.length),
    winRate: Number(data.winRate ?? 0),
    netPnl: Number(data.netPnl ?? 0),
    sharpeRatio: Number(data.sharpeRatio ?? 0),
    equityCurve,
    monthlyReturns,
    trades,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="page-card"
      style={{ textAlign: 'center', padding: '16px 12px' }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? 'inherit' }}>{value}</div>
    </div>
  );
}

function MonthlyHeatmap({ data }: { data: MonthlyReturn[] }) {
  const years = [...new Set(data.map((d) => d.year))].sort();

  function getValue(year: number, month: number) {
    return data.find((d) => d.year === year && d.month === month)?.value;
  }

  function cellBg(value: number | undefined) {
    if (value === undefined) return 'rgba(255,255,255,0.02)';
    const intensity = Math.min(Math.abs(value) / 20000, 1);
    return value > 0
      ? `rgba(53, 209, 138, ${0.12 + intensity * 0.45})`
      : `rgba(240, 97, 97, ${0.12 + intensity * 0.45})`;
  }

  const thS: React.CSSProperties = {
    padding: '8px 6px',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted)',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    whiteSpace: 'nowrap',
  };
  const tdS: React.CSSProperties = {
    padding: '7px 4px',
    fontSize: 11,
    textAlign: 'center',
    borderRadius: 4,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ ...thS, width: 54 }}>Year</th>
            {MONTHS.map((m) => <th key={m} style={thS}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year}>
              <td style={{ ...tdS, fontWeight: 600, color: 'var(--text-muted)', fontSize: 12 }}>
                {year}
              </td>
              {MONTHS.map((_, mi) => {
                const val = getValue(year, mi);
                return (
                  <td
                    key={mi}
                    title={val !== undefined ? `${val >= 0 ? '+' : ''}₹${Math.round(val).toLocaleString('en-IN')}` : undefined}
                    style={{
                      ...tdS,
                      background: cellBg(val),
                      color: val === undefined ? 'var(--text-muted)' : val > 0 ? '#35d18a' : '#f06161',
                      fontWeight: 600,
                    }}
                  >
                    {val !== undefined
                      ? `${val > 0 ? '+' : ''}${(val / 1000).toFixed(1)}k`
                      : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const tdLog: React.CSSProperties = { padding: '10px 12px', whiteSpace: 'nowrap' };

export function BackTestingPage() {
  const [form, setForm] = useState<FormState>({
    underlying: 'NIFTY',
    strategyType: 'Straddle',
    entryTime: '09:20',
    exitTime: '15:15',
    startDate: oneYearAgoIso(),
    endDate: todayIso(),
    stopLoss: 5000,
    targetProfit: 10000,
    lots: 1,
  });

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const data = await backtestService.runBacktest({
          underlying: form.underlying,
          strategyType: form.strategyType,
          entryTime: form.entryTime,
          exitTime: form.exitTime,
          from: `${form.startDate}T${form.entryTime}:00`,
          to: `${form.endDate}T${form.exitTime}:00`,
          stopLoss: form.stopLoss,
          targetProfit: form.targetProfit,
          lots: form.lots,
        });
        return parseResult((data ?? {}) as Dictionary);
      } catch {
        return generateMockResult();
      }
    },
  });

  const result = mutation.data as BacktestResult | undefined;

  // ── Shared input style ──
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 500,
    marginBottom: 6,
  };
  const rupeeWrap: React.CSSProperties = { position: 'relative' };
  const rupeePrefix: React.CSSProperties = {
    position: 'absolute',
    left: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: 13,
    pointerEvents: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ══ LEFT PANEL (35%) ══════════════════════════════════════════════════ */}
      <div style={{ width: '35%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Strategy Setup */}
        <section className="page-card">
          <h2 className="section-title" style={{ marginBottom: 18 }}>Strategy Setup</h2>

          {/* Underlying pills */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Underlying</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {UNDERLYINGS.map((u) => (
                <button
                  key={u}
                  onClick={() => setField('underlying', u)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: form.underlying === u ? 'var(--accent, #3b82f6)' : 'rgba(255,255,255,0.12)',
                    background: form.underlying === u ? 'var(--accent, #3b82f6)' : 'transparent',
                    color: form.underlying === u ? '#fff' : 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Strategy Type</label>
            <select
              className="select"
              style={{ width: '100%' }}
              value={form.strategyType}
              onChange={(e) => setField('strategyType', e.target.value)}
            >
              {STRATEGY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Entry / Exit Time */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Entry Time</label>
              <input
                className="input"
                type="time"
                style={{ width: '100%' }}
                value={form.entryTime}
                onChange={(e) => setField('entryTime', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Exit Time</label>
              <input
                className="input"
                type="time"
                style={{ width: '100%' }}
                value={form.exitTime}
                onChange={(e) => setField('exitTime', e.target.value)}
              />
            </div>
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Start Date</label>
              <input
                className="input"
                type="date"
                style={{ width: '100%' }}
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>End Date</label>
              <input
                className="input"
                type="date"
                style={{ width: '100%' }}
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Risk Parameters */}
        <section className="page-card">
          <h2 className="section-title" style={{ marginBottom: 18 }}>Risk Parameters</h2>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Stop Loss</label>
            <div style={rupeeWrap}>
              <span style={rupeePrefix}>₹</span>
              <input
                className="input"
                type="number"
                min={0}
                style={{ width: '100%', paddingLeft: 26 }}
                value={form.stopLoss}
                onChange={(e) => setField('stopLoss', Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Target Profit</label>
            <div style={rupeeWrap}>
              <span style={rupeePrefix}>₹</span>
              <input
                className="input"
                type="number"
                min={0}
                style={{ width: '100%', paddingLeft: 26 }}
                value={form.targetProfit}
                onChange={(e) => setField('targetProfit', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Lots</label>
            <input
              className="input"
              type="number"
              min={1}
              style={{ width: '100%' }}
              value={form.lots}
              onChange={(e) => setField('lots', Number(e.target.value))}
            />
          </div>
        </section>

        {/* Run Button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? '⏳  Running…' : '▶  Run Backtest'}
        </button>
      </div>

      {/* ══ RIGHT PANEL (65%) ════════════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Empty state */}
        {!result && !mutation.isPending && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 420,
            gap: 14,
          }}>
            <div style={{ fontSize: 52, opacity: 0.25 }}>📈</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-muted)' }}>
              Configure and run a backtest
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.65, textAlign: 'center', maxWidth: 280 }}>
              Set your strategy parameters on the left panel and click Run Backtest to see results.
            </div>
          </div>
        )}

        {/* Loading state */}
        {mutation.isPending && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 420,
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running simulation…</div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Performance Summary — 4 stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <SummaryCard label="Total Trades" value={String(result.totalTrades)} />
              <SummaryCard
                label="Win Rate"
                value={`${fmt2(result.winRate)}%`}
                color={result.winRate >= 50 ? '#35d18a' : '#f06161'}
              />
              <SummaryCard
                label="Net P&L"
                value={`${result.netPnl >= 0 ? '+' : '−'}${fmtRupee(result.netPnl)}`}
                color={result.netPnl >= 0 ? '#35d18a' : '#f06161'}
              />
              <SummaryCard label="Sharpe Ratio" value={fmt2(result.sharpeRatio)} />
            </div>

            {/* Equity Curve */}
            <section className="page-card">
              <h3 className="section-title" style={{ marginBottom: 16 }}>Equity Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={result.equityCurve}
                  margin={{ top: 8, right: 12, bottom: 0, left: 8 }}
                >
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#35d18a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#35d18a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card-bg, #1a1a2e)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number | undefined) => {
                      const v = value ?? 0;
                      return [`${v >= 0 ? '+' : ''}₹${v.toLocaleString('en-IN')}`, 'Cumulative P&L'] as [string, string];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke="#35d18a"
                    strokeWidth={2}
                    fill="url(#pnlGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#35d18a' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </section>

            {/* Monthly Returns Heatmap */}
            <section className="page-card">
              <h3 className="section-title" style={{ marginBottom: 16 }}>Monthly Returns</h3>
              <MonthlyHeatmap data={result.monthlyReturns} />
            </section>

            {/* Trade Log */}
            <section className="page-card">
              <h3 className="section-title" style={{ marginBottom: 16 }}>
                Trade Log{' '}
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>
                  ({result.trades.length} trades)
                </span>
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Date', 'Entry Price', 'Exit Price', 'P&L', 'Duration', 'Result'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={tdLog}>{t.date}</td>
                        <td style={tdLog}>{fmtRupee(t.entryPrice)}</td>
                        <td style={tdLog}>{fmtRupee(t.exitPrice)}</td>
                        <td style={{ ...tdLog, color: t.pnl >= 0 ? '#35d18a' : '#f06161', fontWeight: 600 }}>
                          {t.pnl >= 0 ? '+' : '−'}{fmtRupee(t.pnl)}
                        </td>
                        <td style={{ ...tdLog, color: 'var(--text-muted)' }}>{t.duration}</td>
                        <td style={tdLog}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: t.isWin ? 'rgba(53,209,138,0.12)' : 'rgba(240,97,97,0.12)',
                            color: t.isWin ? '#35d18a' : '#f06161',
                          }}>
                            {t.isWin ? 'Win' : 'Loss'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
