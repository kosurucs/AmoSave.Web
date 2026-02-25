import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';

/* ── constants ─────────────────────────────────────────────── */
const BG         = '#0f1117';
const SURFACE    = '#1a1d2e';
const BORDER     = '#2a2d3e';
const TEXT       = '#e2e8f0';
const TEXT_MUTED = '#64748b';
const CE_COLOR   = '#35d18a';
const PE_COLOR   = '#f06161';
const LINE_COLORS = ['#6366f1', '#f59e0b', '#22d3ee'] as const;

/* ── types ──────────────────────────────────────────────────── */
type Underlying = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY';
type ChartMode  = 'Straddle' | 'Strangle';

const UNDERLYINGS: Underlying[] = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];

const EXPIRIES: Record<Underlying, [string, string, string]> = {
  NIFTY:     ['23-Jan-2025', '30-Jan-2025', '27-Feb-2025'],
  BANKNIFTY: ['22-Jan-2025', '29-Jan-2025', '26-Feb-2025'],
  FINNIFTY:  ['21-Jan-2025', '28-Jan-2025', '25-Feb-2025'],
};

/* Straddle open premiums [near, next, monthly] */
const STRADDLE_OPENS: Record<Underlying, [number, number, number]> = {
  NIFTY:     [188, 315, 485],
  BANKNIFTY: [290, 530, 840],
  FINNIFTY:  [162, 285, 455],
};

const IV_VALUES: Record<Underlying, number> = {
  NIFTY: 16.5, BANKNIFTY: 19.2, FINNIFTY: 18.8,
};

/* ── time axis generation ───────────────────────────────────── */
function generateTimes(): string[] {
  const t: string[] = [];
  let h = 9, m = 15;
  while (h < 15 || (h === 15 && m <= 30)) {
    t.push(`${h}:${m.toString().padStart(2, '0')}`);
    m += 5;
    if (m >= 60) { h++; m -= 60; }
  }
  return t;
}
const TIMES = generateTimes(); // 76 ticks, 9:15–15:30

/* ── deterministic pseudo-random ────────────────────────────── */
function frand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ── premium series with quadratic theta decay + noise ─────── */
function generatePremium(open: number, decayRatio: number, vol: number, seed: number): number[] {
  const n   = TIMES.length;
  const end = open * decayRatio;
  const out: number[] = [open];
  let cur = open;
  for (let i = 1; i < n; i++) {
    const prog   = i / (n - 1);
    const target = open + (end - open) * prog * prog;
    const noise  = (frand(seed + i) - 0.5) * vol;
    cur = cur * 0.92 + target * 0.08 + noise;
    cur = Math.max(5, cur);
    out.push(Math.round(cur * 10) / 10);
  }
  return out;
}

interface ChartPoint { time: string; p0: number; p1: number; p2: number; }

function buildChartData(und: Underlying, mode: ChartMode): ChartPoint[] {
  const f        = mode === 'Strangle' ? 0.62 : 1.0;
  const [o0, o1, o2] = STRADDLE_OPENS[und];
  const seed     = und.length * 17;
  const s0 = generatePremium(o0 * f, 0.50, o0 * f * 0.025, seed);
  const s1 = generatePremium(o1 * f, 0.88, o1 * f * 0.012, seed + 100);
  const s2 = generatePremium(o2 * f, 0.96, o2 * f * 0.008, seed + 200);
  return TIMES.map((time, i) => ({ time, p0: s0[i], p1: s1[i], p2: s2[i] }));
}

function getDataKey(idx: number): 'p0' | 'p1' | 'p2' {
  if (idx === 1) return 'p1';
  if (idx === 2) return 'p2';
  return 'p0';
}

/* ── custom tooltip ─────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StraddleTooltip({ active, payload, label, opens }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: TEXT_MUTED, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: { dataKey: string; value: number; color: string; name: string }) => {
        const idx  = p.dataKey === 'p0' ? 0 : p.dataKey === 'p1' ? 1 : 2;
        const chg  = p.value - (opens as number[])[idx];
        return (
          <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>
            <span style={{ opacity: 0.75 }}>{(opens as number[])[idx] && p.name}: </span>
            <strong>&#x20b9;{p.value.toFixed(1)}</strong>
            <span style={{ marginLeft: 8, color: chg >= 0 ? CE_COLOR : PE_COLOR, fontSize: 11 }}>
              {chg >= 0 ? '+' : ''}&#x20b9;{chg.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, sub, valueColor = TEXT }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 18px', flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: valueColor }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────── */
export function StraddleChartsPage() {
  const [underlying, setUnderlying] = useState<Underlying>('NIFTY');
  const [expiry,     setExpiry]     = useState<string>(EXPIRIES.NIFTY[0]);
  const [mode,       setMode]       = useState<ChartMode>('Straddle');

  const expiries   = EXPIRIES[underlying];
  const chartData  = useMemo(() => buildChartData(underlying, mode), [underlying, mode]);

  const factor      = mode === 'Strangle' ? 0.62 : 1.0;
  const [o0, o1, o2] = STRADDLE_OPENS[underlying];
  const openPremiums: number[] = [o0 * factor, o1 * factor, o2 * factor];
  const refOpen     = openPremiums[0];

  const nearIdx    = expiries.indexOf(expiry);
  const dk         = getDataKey(Math.max(0, nearIdx));
  const last       = chartData[chartData.length - 1];
  const curPremium = last[dk];
  const openPrem   = openPremiums[Math.max(0, nearIdx)];
  const chgAbs     = curPremium - openPrem;
  const chgPct     = (chgAbs / openPrem) * 100;

  const pill = (active: boolean) => ({
    padding: '5px 16px', borderRadius: 20,
    border: `1px solid ${active ? CE_COLOR : BORDER}`,
    background: active ? 'rgba(53,209,138,0.12)' : 'transparent',
    color: active ? CE_COLOR : TEXT_MUTED,
    cursor: 'pointer' as const, fontSize: 13,
    fontWeight: active ? 700 : 400, transition: 'all .15s',
  });

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '20px 24px', color: TEXT, fontFamily: 'inherit' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Straddle / Strangle Charts</h2>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {UNDERLYINGS.map(u => (
            <button key={u} onClick={() => { setUnderlying(u); setExpiry(EXPIRIES[u][0]); }} style={pill(underlying === u)}>{u}</button>
          ))}
        </div>

        <select value={expiry} onChange={e => setExpiry(e.target.value)}
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, padding: '6px 12px', fontSize: 13, cursor: 'pointer', minWidth: 140 }}>
          {expiries.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>

        {/* Straddle / Strangle toggle */}
        <div style={{ display: 'flex', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
          {(['Straddle', 'Strangle'] as ChartMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding: '6px 18px', border: 'none', background: mode === m ? CE_COLOR : 'transparent', color: mode === m ? '#0f1117' : TEXT_MUTED, fontWeight: mode === m ? 700 : 400, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 16px 12px', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          {underlying} {mode} Premium &mdash; All Expiries
          <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 400, marginLeft: 8 }}>9:15 AM – 3:30 PM (5-min)</span>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
            <XAxis dataKey="time" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false} interval={11} />
            <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `\u20b9${v}`} width={58} />
            <Tooltip content={<StraddleTooltip opens={openPremiums} />} cursor={{ stroke: BORDER, strokeWidth: 1 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value: string) => {
                const idx = value === 'p0' ? 0 : value === 'p1' ? 1 : 2;
                return <span style={{ color: LINE_COLORS[idx] }}>{expiries[idx]}</span>;
              }} />
            <ReferenceLine y={refOpen} stroke={TEXT_MUTED} strokeDasharray="6 3" strokeWidth={1}
              label={{ value: 'Open', fill: TEXT_MUTED, fontSize: 10, position: 'right' }} />
            {(['p0', 'p1', 'p2'] as const).map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[i]} dot={false} strokeWidth={2} name={key} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Current Premium" value={`\u20b9${curPremium.toFixed(1)}`} sub={expiry} />
        <StatCard
          label="Change from Open"
          value={`${chgAbs >= 0 ? '+' : ''}\u20b9${chgAbs.toFixed(1)}`}
          sub={`Open: \u20b9${openPrem.toFixed(1)}`}
          valueColor={chgAbs >= 0 ? CE_COLOR : PE_COLOR}
        />
        <StatCard
          label="% Change"
          value={`${chgPct >= 0 ? '+' : ''}${chgPct.toFixed(2)}%`}
          valueColor={chgPct >= 0 ? CE_COLOR : PE_COLOR}
        />
        <StatCard label="IV (Near Expiry)" value={`${IV_VALUES[underlying].toFixed(1)}%`} sub="Implied Volatility" />
      </div>
    </div>
  );
}
