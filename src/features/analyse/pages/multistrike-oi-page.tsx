import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
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
const ATM_COLOR  = '#f59e0b';

/* ── types ──────────────────────────────────────────────────── */
type Underlying = 'BANKNIFTY' | 'NIFTY' | 'FINNIFTY' | 'MIDCPNIFTY' | 'SENSEX' | 'BANKEX';
const UNDERLYINGS: Underlying[] = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

const ATM_STRIKES: Record<Underlying, number> = {
  NIFTY: 23400, BANKNIFTY: 49800, FINNIFTY: 23000,
  MIDCPNIFTY: 12000, SENSEX: 77000, BANKEX: 57000,
};
const STRIKE_STEPS: Record<Underlying, number> = {
  NIFTY: 50, BANKNIFTY: 100, FINNIFTY: 50,
  MIDCPNIFTY: 25, SENSEX: 100, BANKEX: 100,
};
const EXPIRIES_MAP: Record<Underlying, string[]> = {
  BANKNIFTY:  ['22-Jan-2025', '29-Jan-2025', '26-Feb-2025'],
  NIFTY:      ['23-Jan-2025', '30-Jan-2025', '27-Feb-2025'],
  FINNIFTY:   ['21-Jan-2025', '28-Jan-2025', '25-Feb-2025'],
  MIDCPNIFTY: ['20-Jan-2025', '27-Jan-2025', '24-Feb-2025'],
  SENSEX:     ['21-Jan-2025', '28-Jan-2025', '25-Feb-2025'],
  BANKEX:     ['21-Jan-2025', '28-Jan-2025', '25-Feb-2025'],
};

/* ── types ──────────────────────────────────────────────────── */
interface StrikeRow {
  strike: number;
  isAtm: boolean;
  ceOi: number;
  peOi: number;
  ceChg: number;
  peChg: number;
  pcr: number;
}

/* ── helpers ────────────────────────────────────────────────── */
function frand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function toLakhs(v: number): number { return Math.round(v / 1_00_000); }

function generateData(und: Underlying, low: number, high: number): StrikeRow[] {
  const atm  = ATM_STRIKES[und];
  const step = STRIKE_STEPS[und];
  const base = (und === 'BANKNIFTY' || und === 'SENSEX') ? 25_00_000 : 60_00_000;
  const rows: StrikeRow[] = [];

  for (let i = -low; i <= high; i++) {
    const strike = atm + i * step;
    const dist   = Math.abs(i);
    const decay  = 1 / (1 + dist * 0.28);
    const seed   = strike + und.length * 13;

    const ceBase = base * decay * (i >= 0 ? 1.6 : 0.75) * (0.8 + frand(seed)     * 0.4);
    const peBase = base * decay * (i <= 0 ? 1.6 : 0.75) * (0.8 + frand(seed + 1) * 0.4);
    const ceOi   = Math.round(ceBase);
    const peOi   = Math.round(peBase);
    const ceChg  = Math.round(ceOi * (frand(seed + 2) * 0.30 - 0.05));
    const peChg  = Math.round(peOi * (frand(seed + 3) * 0.30 - 0.05));

    rows.push({
      strike,
      isAtm: i === 0,
      ceOi,
      peOi,
      ceChg,
      peChg,
      pcr: ceOi > 0 ? parseFloat((peOi / ceOi).toFixed(2)) : 0,
    });
  }
  return rows;
}

/* ── custom tooltip ─────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OiChangeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const ce = payload.find((p: { dataKey: string }) => p.dataKey === 'ceChg');
  const pe = payload.find((p: { dataKey: string }) => p.dataKey === 'peChg');
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: TEXT_MUTED, marginBottom: 6, fontWeight: 600 }}>Strike {label}</div>
      {ce && <div style={{ color: CE_COLOR }}>CE Chg: {ce.value >= 0 ? '+' : ''}{toLakhs(ce.value as number)}L</div>}
      {pe && <div style={{ color: PE_COLOR }}>PE Chg: {pe.value >= 0 ? '+' : ''}{toLakhs(pe.value as number)}L</div>}
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────── */
export function MultistrikeOiPage() {
  const [underlying,  setUnderlying]  = useState<Underlying>('BANKNIFTY');
  const [expiry,      setExpiry]      = useState(EXPIRIES_MAP.BANKNIFTY[0]);
  const [rangeBelow,  setRangeBelow]  = useState(5);
  const [rangeAbove,  setRangeAbove]  = useState(5);

  const expiries = EXPIRIES_MAP[underlying];
  const atm      = ATM_STRIKES[underlying];
  const rows     = useMemo(() => generateData(underlying, rangeBelow, rangeAbove), [underlying, rangeBelow, rangeAbove]);

  const chartData = rows.map(r => ({ strike: r.strike, ceChg: r.ceChg, peChg: r.peChg }));

  const pill = (active: boolean) => ({
    padding: '5px 14px', borderRadius: 20,
    border: `1px solid ${active ? CE_COLOR : BORDER}`,
    background: active ? 'rgba(53,209,138,0.12)' : 'transparent',
    color: active ? CE_COLOR : TEXT_MUTED,
    cursor: 'pointer' as const, fontSize: 13,
    fontWeight: active ? 700 : 400, transition: 'all .15s',
  });

  function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <input type="number" value={value} min={1} max={20}
        onChange={e => onChange(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
        style={{ width: 52, padding: '5px 8px', borderRadius: 6, border: `1px solid ${BORDER}`, background: SURFACE, color: TEXT, fontSize: 13, textAlign: 'center' }} />
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '20px 24px', color: TEXT, fontFamily: 'inherit' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Multi-Strike Open Interest</h2>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UNDERLYINGS.map(u => (
            <button key={u} onClick={() => { setUnderlying(u); setExpiry(EXPIRIES_MAP[u][0]); }} style={pill(underlying === u)}>{u}</button>
          ))}
        </div>

        <select value={expiry} onChange={e => setExpiry(e.target.value)}
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, padding: '6px 12px', fontSize: 13, cursor: 'pointer', minWidth: 140 }}>
          {expiries.map(ex => <option key={ex} value={ex}>{ex}</option>)}
        </select>

        {/* Strike range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: TEXT_MUTED }}>
          <span>ATM&#8722;</span>
          <NumInput value={rangeBelow} onChange={setRangeBelow} />
          <span>to ATM+</span>
          <NumInput value={rangeAbove} onChange={setRangeAbove} />
        </div>

        <div style={{ padding: '4px 14px', borderRadius: 16, background: 'rgba(245,158,11,0.12)', border: `1px solid ${ATM_COLOR}`, color: ATM_COLOR, fontSize: 13, fontWeight: 700 }}>
          ATM {atm.toLocaleString()}
        </div>
      </div>

      {/* ── Bar Chart ── */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 16px 12px', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          OI Change &mdash; {underlying} {expiry}
          <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 400, marginLeft: 8 }}>CE vs PE, side-by-side</span>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} barGap={2} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
            <XAxis dataKey="strike" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false}
              tickFormatter={(v: number) => v.toLocaleString()} />
            <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={56}
              tickFormatter={(v: number) => `${toLakhs(v)}L`} />
            <Tooltip content={<OiChangeTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value: string) => (
                <span style={{ color: value === 'ceChg' ? CE_COLOR : PE_COLOR }}>
                  {value === 'ceChg' ? 'CE OI Chg' : 'PE OI Chg'}
                </span>
              )} />
            <ReferenceLine y={0} stroke={BORDER} strokeWidth={2} />
            <ReferenceLine x={atm} stroke={ATM_COLOR} strokeDasharray="6 3" strokeWidth={2}
              label={{ value: 'ATM', fill: ATM_COLOR, fontSize: 10, position: 'top' }} />
            <Bar dataKey="ceChg" fill={CE_COLOR} radius={[3, 3, 0, 0]} maxBarSize={16} name="ceChg" />
            <Bar dataKey="peChg" fill={PE_COLOR} radius={[3, 3, 0, 0]} maxBarSize={16} name="peChg" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Table ── */}
      <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}` }}>
          Strike-wise OI Data
          <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 400, marginLeft: 8 }}>(OI in Lakhs)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['Strike', 'CE OI (L)', 'CE Chg', 'PE OI (L)', 'PE Chg', 'PCR'].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'right', color: TEXT_MUTED, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.strike} style={{
                  borderBottom: `1px solid ${BORDER}`,
                  background: r.isAtm
                    ? 'rgba(245,158,11,0.07)'
                    : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.016)',
                }}>
                  <td style={{ padding: '7px 14px', textAlign: 'right', fontWeight: r.isAtm ? 700 : 500, color: r.isAtm ? ATM_COLOR : TEXT, fontVariantNumeric: 'tabular-nums' }}>
                    {r.strike.toLocaleString()}{r.isAtm && <span style={{ marginLeft: 6, fontSize: 10 }}>&#9733;</span>}
                  </td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{toLakhs(r.ceOi).toLocaleString()}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: r.ceChg >= 0 ? CE_COLOR : PE_COLOR, fontVariantNumeric: 'tabular-nums' }}>
                    {r.ceChg >= 0 ? '+' : ''}{toLakhs(r.ceChg)}
                  </td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{toLakhs(r.peOi).toLocaleString()}</td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: r.peChg >= 0 ? CE_COLOR : PE_COLOR, fontVariantNumeric: 'tabular-nums' }}>
                    {r.peChg >= 0 ? '+' : ''}{toLakhs(r.peChg)}
                  </td>
                  <td style={{ padding: '7px 14px', textAlign: 'right', color: r.pcr >= 1 ? CE_COLOR : PE_COLOR, fontVariantNumeric: 'tabular-nums' }}>{r.pcr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
