import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

/* ── constants ─────────────────────────────────────────────── */
const BG         = '#0f1117';
const SURFACE    = '#1a1d2e';
const BORDER     = '#2a2d3e';
const TEXT       = '#e2e8f0';
const TEXT_MUTED = '#64748b';
const CE_COLOR   = '#35d18a';
const PE_COLOR   = '#f06161';
const AMBER      = '#f59e0b';

/* ── types ──────────────────────────────────────────────────── */
type Underlying = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'MIDCPNIFTY' | 'SENSEX' | 'BANKEX';
const UNDERLYINGS: Underlying[] = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

interface ExpiryRow {
  expiry: string;
  futPrice: number;
  basis: number;
  oi: number;
  oiChg: number;
  vol: number;
  coc: number;
}

interface FutData {
  ltp: number;
  basis: number;
  lotSize: number;
  oi: number;
  oiChgPct: number;
  ceTotalOi: number;
  peTotalOi: number;
  pcr: number;
  annualBasis: number;
  daysToExpiry: number;
  impliedRate: number;
  currentOi: number;
  avgOi1M: number;
  rolloverPct: number;
  pcrHistory: { v: number }[];
  expiryRows: ExpiryRow[];
}

/* ── mock data ──────────────────────────────────────────────── */
const DATA: Record<Underlying, FutData> = {
  NIFTY: {
    ltp: 23452.30, basis: 52.30, lotSize: 75, oi: 12_548_750, oiChgPct: 2.4,
    ceTotalOi: 45_200_000, peTotalOi: 58_400_000, pcr: 1.29,
    annualBasis: 8.2, daysToExpiry: 6, impliedRate: 8.2,
    currentOi: 12_548_750, avgOi1M: 11_200_000, rolloverPct: 68.4,
    pcrHistory: [1.15, 1.18, 1.22, 1.20, 1.25, 1.28, 1.31, 1.29, 1.27, 1.29].map(v => ({ v })),
    expiryRows: [
      { expiry: '23-Jan-2025', futPrice: 23452.30, basis:  52.30, oi: 12_548_750, oiChg:  298_500, vol:  486_200, coc: 8.2 },
      { expiry: '30-Jan-2025', futPrice: 23502.15, basis: 102.15, oi:  4_820_000, oiChg:  112_000, vol:  186_400, coc: 8.6 },
      { expiry: '27-Feb-2025', futPrice: 23680.00, basis: 280.00, oi:  2_140_000, oiChg:   42_000, vol:   78_200, coc: 8.1 },
      { expiry: '27-Mar-2025', futPrice: 23855.00, basis: 455.00, oi:    620_000, oiChg:   18_000, vol:   28_400, coc: 7.9 },
    ],
  },
  BANKNIFTY: {
    ltp: 49832.50, basis: 122.50, lotSize: 15, oi: 8_246_500, oiChgPct: 1.8,
    ceTotalOi: 32_400_000, peTotalOi: 38_600_000, pcr: 1.19,
    annualBasis: 9.0, daysToExpiry: 5, impliedRate: 9.0,
    currentOi: 8_246_500, avgOi1M: 7_820_000, rolloverPct: 62.8,
    pcrHistory: [1.05, 1.08, 1.12, 1.10, 1.15, 1.18, 1.21, 1.19, 1.17, 1.19].map(v => ({ v })),
    expiryRows: [
      { expiry: '22-Jan-2025', futPrice: 49832.50, basis: 122.50, oi: 8_246_500, oiChg:  146_200, vol:  326_800, coc: 9.0 },
      { expiry: '29-Jan-2025', futPrice: 49960.00, basis: 250.00, oi: 2_840_000, oiChg:   62_400, vol:  124_600, coc: 8.8 },
      { expiry: '26-Feb-2025', futPrice: 50220.00, basis: 510.00, oi:   986_000, oiChg:   28_000, vol:   48_200, coc: 8.5 },
      { expiry: '27-Mar-2025', futPrice: 50480.00, basis: 770.00, oi:   284_000, oiChg:   12_000, vol:   18_400, coc: 8.2 },
    ],
  },
  FINNIFTY: {
    ltp: 23086.40, basis: 86.40, lotSize: 40, oi: 5_182_000, oiChgPct: 1.2,
    ceTotalOi: 18_600_000, peTotalOi: 21_400_000, pcr: 1.15,
    annualBasis: 8.6, daysToExpiry: 4, impliedRate: 8.6,
    currentOi: 5_182_000, avgOi1M: 4_960_000, rolloverPct: 58.2,
    pcrHistory: [1.02, 1.05, 1.08, 1.06, 1.10, 1.12, 1.16, 1.14, 1.13, 1.15].map(v => ({ v })),
    expiryRows: [
      { expiry: '21-Jan-2025', futPrice: 23086.40, basis:  86.40, oi: 5_182_000, oiChg:  62_400, vol:  186_400, coc: 8.6 },
      { expiry: '28-Jan-2025', futPrice: 23148.00, basis: 148.00, oi: 1_840_000, oiChg:  28_000, vol:   62_800, coc: 8.4 },
      { expiry: '25-Feb-2025', futPrice: 23310.00, basis: 310.00, oi:   642_000, oiChg:  14_200, vol:   24_600, coc: 8.1 },
    ],
  },
  MIDCPNIFTY: {
    ltp: 12186.70, basis: 36.70, lotSize: 50, oi: 2_846_000, oiChgPct: 0.8,
    ceTotalOi: 9_200_000, peTotalOi: 10_400_000, pcr: 1.13,
    annualBasis: 8.8, daysToExpiry: 3, impliedRate: 8.8,
    currentOi: 2_846_000, avgOi1M: 2_640_000, rolloverPct: 54.6,
    pcrHistory: [1.01, 1.03, 1.06, 1.04, 1.08, 1.10, 1.12, 1.11, 1.12, 1.13].map(v => ({ v })),
    expiryRows: [
      { expiry: '20-Jan-2025', futPrice: 12186.70, basis:  36.70, oi: 2_846_000, oiChg:  22_800, vol:   86_400, coc: 8.8 },
      { expiry: '27-Jan-2025', futPrice: 12214.00, basis:  64.00, oi:   820_000, oiChg:   8_400, vol:   28_600, coc: 8.6 },
      { expiry: '24-Feb-2025', futPrice: 12295.00, basis: 145.00, oi:   264_000, oiChg:   4_200, vol:   10_400, coc: 8.3 },
    ],
  },
  SENSEX: {
    ltp: 77284.60, basis: 184.60, lotSize: 10, oi: 1_482_000, oiChgPct: 1.4,
    ceTotalOi: 6_200_000, peTotalOi: 7_400_000, pcr: 1.19,
    annualBasis: 8.5, daysToExpiry: 4, impliedRate: 8.5,
    currentOi: 1_482_000, avgOi1M: 1_320_000, rolloverPct: 61.2,
    pcrHistory: [1.05, 1.08, 1.10, 1.08, 1.12, 1.14, 1.18, 1.17, 1.18, 1.19].map(v => ({ v })),
    expiryRows: [
      { expiry: '21-Jan-2025', futPrice: 77284.60, basis: 184.60, oi: 1_482_000, oiChg:  20_600, vol:   48_400, coc: 8.5 },
      { expiry: '28-Jan-2025', futPrice: 77384.00, basis: 284.00, oi:   486_000, oiChg:   8_400, vol:   16_800, coc: 8.3 },
      { expiry: '25-Feb-2025', futPrice: 77645.00, basis: 545.00, oi:   168_000, oiChg:   3_200, vol:    6_800, coc: 8.0 },
    ],
  },
  BANKEX: {
    ltp: 57642.80, basis: 142.80, lotSize: 15, oi: 1_186_000, oiChgPct: 1.0,
    ceTotalOi: 4_800_000, peTotalOi: 5_600_000, pcr: 1.17,
    annualBasis: 9.1, daysToExpiry: 4, impliedRate: 9.1,
    currentOi: 1_186_000, avgOi1M: 1_060_000, rolloverPct: 57.4,
    pcrHistory: [1.02, 1.05, 1.08, 1.06, 1.10, 1.12, 1.15, 1.14, 1.16, 1.17].map(v => ({ v })),
    expiryRows: [
      { expiry: '21-Jan-2025', futPrice: 57642.80, basis: 142.80, oi: 1_186_000, oiChg:  11_800, vol:   28_400, coc: 9.1 },
      { expiry: '28-Jan-2025', futPrice: 57724.00, basis: 224.00, oi:   368_000, oiChg:   4_200, vol:    9_800, coc: 8.8 },
      { expiry: '25-Feb-2025', futPrice: 57940.00, basis: 440.00, oi:   118_000, oiChg:   2_000, vol:    3_800, coc: 8.4 },
    ],
  },
};

/* ── helpers ────────────────────────────────────────────────── */
function fmtOi(v: number): string {
  if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000)    return `${(v / 1_00_000).toFixed(2)} L`;
  return v.toLocaleString();
}
function fmtPrice(v: number, dec = 2): string {
  return '\u20b9' + v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/* ── sub-components ─────────────────────────────────────────── */
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      {children}
    </div>
  );
}

function CardRow({ label, value, valueColor = TEXT }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
      <span style={{ color: TEXT_MUTED, fontSize: 13 }}>{label}</span>
      <span style={{ color: valueColor, fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────── */
export function FuturesDataPage() {
  const [underlying, setUnderlying] = useState<Underlying>('NIFTY');
  const d = useMemo(() => DATA[underlying], [underlying]);

  const pill = (active: boolean) => ({
    padding: '5px 14px', borderRadius: 20,
    border: `1px solid ${active ? CE_COLOR : BORDER}`,
    background: active ? 'rgba(53,209,138,0.12)' : 'transparent',
    color: active ? CE_COLOR : TEXT_MUTED,
    cursor: 'pointer' as const, fontSize: 13,
    fontWeight: active ? 700 : 400, transition: 'all .15s',
  });

  const rolloverW = Math.min(100, d.rolloverPct);

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '20px 24px', color: TEXT, fontFamily: 'inherit' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Futures &amp; Options Data</h2>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {UNDERLYINGS.map(u => (
          <button key={u} onClick={() => setUnderlying(u)} style={pill(underlying === u)}>{u}</button>
        ))}
      </div>

      {/* ── 2×2 Card Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>

        {/* Card 1: Futures Overview */}
        <Card title="Futures Overview">
          <CardRow label="LTP" value={fmtPrice(d.ltp)} />
          <CardRow label="Basis (Spot Premium)" value={`${d.basis >= 0 ? '+' : ''}${fmtPrice(d.basis)}`} valueColor={d.basis >= 0 ? CE_COLOR : PE_COLOR} />
          <CardRow label="Lot Size" value={d.lotSize.toString()} />
          <CardRow label="Open Interest" value={fmtOi(d.oi)} />
          <CardRow label="OI Change" value={`${d.oiChgPct >= 0 ? '+' : ''}${d.oiChgPct.toFixed(1)}%`} valueColor={d.oiChgPct >= 0 ? CE_COLOR : PE_COLOR} />
        </Card>

        {/* Card 2: Options PCR */}
        <Card title="Options PCR">
          <CardRow label="CE OI Total" value={fmtOi(d.ceTotalOi)} valueColor={CE_COLOR} />
          <CardRow label="PE OI Total" value={fmtOi(d.peTotalOi)} valueColor={PE_COLOR} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: TEXT_MUTED, fontSize: 13 }}>PCR Ratio</span>
            <span style={{ padding: '3px 12px', borderRadius: 12, background: d.pcr >= 1 ? 'rgba(53,209,138,0.12)' : 'rgba(240,97,97,0.12)', color: d.pcr >= 1 ? CE_COLOR : PE_COLOR, fontWeight: 700, fontSize: 14 }}>
              {d.pcr.toFixed(2)} {d.pcr >= 1 ? '\u2191 Bullish' : '\u2193 Bearish'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4 }}>PCR — last 10 sessions</div>
          <ResponsiveContainer width="100%" height={52}>
            <LineChart data={d.pcrHistory}>
              <Line type="monotone" dataKey="v" stroke={d.pcr >= 1 ? CE_COLOR : PE_COLOR} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Card 3: Cost of Carry */}
        <Card title="Cost of Carry">
          <CardRow label="Annualised Basis" value={`${d.annualBasis.toFixed(1)}%`} valueColor={AMBER} />
          <CardRow label="Days to Expiry" value={d.daysToExpiry.toString()} />
          <CardRow label="Implied Rate" value={`${d.impliedRate.toFixed(1)}%`} />
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.2)`, fontSize: 12, color: AMBER, lineHeight: 1.5 }}>
            CoC = (Futures &minus; Spot) / Spot &times; (365 / Days) &times; 100
          </div>
        </Card>

        {/* Card 4: Rollover Data */}
        <Card title="Rollover Data">
          <CardRow label="Current Month OI" value={fmtOi(d.currentOi)} />
          <CardRow label="1-Month Avg OI"   value={fmtOi(d.avgOi1M)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: TEXT_MUTED, fontSize: 13 }}>Rollover %</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>{d.rolloverPct.toFixed(1)}%</div>
              <div style={{ height: 5, width: 130, background: BORDER, borderRadius: 3, marginTop: 5 }}>
                <div style={{ height: '100%', width: `${rolloverW}%`, background: CE_COLOR, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
          <CardRow label="vs 1M Avg" value={`${((d.currentOi / d.avgOi1M - 1) * 100).toFixed(1)}%`}
            valueColor={d.currentOi >= d.avgOi1M ? CE_COLOR : PE_COLOR} />
        </Card>
      </div>

      {/* ── Expiry Table ── */}
      <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}` }}>
          Futures by Expiry &mdash; {underlying}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['Expiry', 'Futures Price', 'Basis', 'Open Interest', 'OI Change', 'Volume', 'Cost of Carry'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'right', color: TEXT_MUTED, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.expiryRows.map((r, i) => (
                <tr key={r.expiry} style={{
                  borderBottom: `1px solid ${BORDER}`,
                  background: i === 0 ? 'rgba(53,209,138,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.016)',
                }}>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? CE_COLOR : TEXT, whiteSpace: 'nowrap' }}>
                    {r.expiry}
                    {i === 0 && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(53,209,138,0.2)', color: CE_COLOR, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>Near</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(r.futPrice)}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: r.basis >= 0 ? CE_COLOR : PE_COLOR, fontVariantNumeric: 'tabular-nums' }}>
                    {r.basis >= 0 ? '+' : ''}{fmtPrice(r.basis)}
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtOi(r.oi)}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: r.oiChg >= 0 ? CE_COLOR : PE_COLOR, fontVariantNumeric: 'tabular-nums' }}>
                    {r.oiChg >= 0 ? '+' : ''}{fmtOi(r.oiChg)}
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtOi(r.vol)}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: AMBER, fontVariantNumeric: 'tabular-nums' }}>{r.coc.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
