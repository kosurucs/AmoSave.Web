import { useState, useMemo } from 'react';

/* ── constants ─────────────────────────────────────────────── */
const BG         = '#0f1117';
const SURFACE    = '#1a1d2e';
const BORDER     = '#2a2d3e';
const TEXT       = '#e2e8f0';
const TEXT_MUTED = '#64748b';
const CE_COLOR   = '#35d18a';
const PE_COLOR   = '#f06161';

/* ── types ──────────────────────────────────────────────────── */
const TIMEFRAME_KEYS = ['H', 'D', 'W', 'M'] as const;
type TF = (typeof TIMEFRAME_KEYS)[number];

const SIGNAL_TYPES = ['All', 'Candles', 'Moving Average', 'Bullish', 'Bearish'] as const;
type SignalType = (typeof SIGNAL_TYPES)[number];

const SECTORS = ['All', 'IT', 'Banking', 'Auto', 'Pharma', 'Energy'] as const;
type Sector = (typeof SECTORS)[number];

type PatternType = 'candle' | 'ma' | 'bullish' | 'bearish';

interface SignalRow {
  id: number;
  date: string;
  signalName: string;
  patternType: PatternType;
  symbol: string;
  sector: string;
  ltp: number;
  change: number;
  timeframe: TF;
}

/* ── static lookup maps ─────────────────────────────────────── */
const TYPE_FILTER: Record<SignalType, PatternType[]> = {
  All:               ['candle', 'ma', 'bullish', 'bearish'],
  Candles:           ['candle'],
  'Moving Average':  ['ma'],
  Bullish:           ['bullish'],
  Bearish:           ['bearish'],
};

const TF_LABEL: Record<TF, string>  = { H: 'Hourly', D: 'Daily', W: 'Weekly', M: 'Monthly' };
const TF_COLOR: Record<TF, string>  = { H: '#6366f1', D: CE_COLOR, W: '#f59e0b', M: '#f06161' };

/* ── mock data (34 rows) ────────────────────────────────────── */
const MOCK_SIGNALS: SignalRow[] = [
  { id:  1, date:'2025-01-17', signalName:'Bullish Engulfing',        patternType:'bullish', symbol:'RELIANCE',   sector:'Energy',  ltp:  2876.45, change:  1.82, timeframe:'D' },
  { id:  2, date:'2025-01-17', signalName:'Shooting Star',            patternType:'bearish', symbol:'TCS',        sector:'IT',      ltp:  4123.60, change: -0.94, timeframe:'D' },
  { id:  3, date:'2025-01-17', signalName:'Golden Cross (50/200 EMA)',patternType:'ma',      symbol:'NIFTY',      sector:'Index',   ltp: 23400.00, change:  0.55, timeframe:'D' },
  { id:  4, date:'2025-01-17', signalName:'Hammer',                   patternType:'candle',  symbol:'HDFCBANK',   sector:'Banking', ltp:  1685.30, change:  0.74, timeframe:'H' },
  { id:  5, date:'2025-01-17', signalName:'Death Cross (50/200 EMA)', patternType:'ma',      symbol:'INFY',       sector:'IT',      ltp:  1875.20, change: -1.23, timeframe:'W' },
  { id:  6, date:'2025-01-16', signalName:'Doji Star',                patternType:'candle',  symbol:'BANKNIFTY',  sector:'Index',   ltp: 49876.00, change: -0.21, timeframe:'D' },
  { id:  7, date:'2025-01-16', signalName:'Morning Star',             patternType:'bullish', symbol:'WIPRO',      sector:'IT',      ltp:   562.80, change:  1.44, timeframe:'D' },
  { id:  8, date:'2025-01-16', signalName:'Bearish Harami',           patternType:'bearish', symbol:'SBIN',       sector:'Banking', ltp:   764.55, change: -0.88, timeframe:'D' },
  { id:  9, date:'2025-01-16', signalName:'Three White Soldiers',     patternType:'bullish', symbol:'MARUTI',     sector:'Auto',    ltp: 11240.00, change:  2.10, timeframe:'W' },
  { id: 10, date:'2025-01-16', signalName:'Dark Cloud Cover',         patternType:'bearish', symbol:'AXISBANK',   sector:'Banking', ltp:  1056.30, change: -1.45, timeframe:'D' },
  { id: 11, date:'2025-01-15', signalName:'Bullish Marubozu',         patternType:'bullish', symbol:'TATAMOTORS', sector:'Auto',    ltp:   893.45, change:  3.22, timeframe:'D' },
  { id: 12, date:'2025-01-15', signalName:'Inverted Hammer',          patternType:'candle',  symbol:'SUNPHARMA',  sector:'Pharma',  ltp:  1612.75, change:  0.33, timeframe:'H' },
  { id: 13, date:'2025-01-15', signalName:'EMA Crossover (20/50)',    patternType:'ma',      symbol:'HCLTECH',    sector:'IT',      ltp:  1792.60, change:  0.89, timeframe:'D' },
  { id: 14, date:'2025-01-15', signalName:'Evening Star',             patternType:'bearish', symbol:'BAJFINANCE', sector:'Banking', ltp:  7012.50, change: -2.05, timeframe:'D' },
  { id: 15, date:'2025-01-15', signalName:'Spinning Top',             patternType:'candle',  symbol:'ICICIBANK',  sector:'Banking', ltp:  1234.80, change: -0.15, timeframe:'H' },
  { id: 16, date:'2025-01-14', signalName:'Bullish Piercing',         patternType:'bullish', symbol:'NIFTY',      sector:'Index',   ltp: 23245.00, change:  1.12, timeframe:'D' },
  { id: 17, date:'2025-01-14', signalName:'Bearish Engulfing',        patternType:'bearish', symbol:'RELIANCE',   sector:'Energy',  ltp:  2823.10, change: -1.92, timeframe:'D' },
  { id: 18, date:'2025-01-14', signalName:'Inside Bar Breakout',      patternType:'bullish', symbol:'WIPRO',      sector:'IT',      ltp:   554.40, change:  1.05, timeframe:'W' },
  { id: 19, date:'2025-01-14', signalName:'Hanging Man',              patternType:'bearish', symbol:'TCS',        sector:'IT',      ltp:  4162.00, change: -0.65, timeframe:'H' },
  { id: 20, date:'2025-01-14', signalName:'Double Bottom',            patternType:'bullish', symbol:'SBIN',       sector:'Banking', ltp:   771.20, change:  0.87, timeframe:'D' },
  { id: 21, date:'2025-01-13', signalName:'Tweezer Bottom',           patternType:'bullish', symbol:'HCLTECH',    sector:'IT',      ltp:  1776.00, change:  1.58, timeframe:'D' },
  { id: 22, date:'2025-01-13', signalName:'RSI Divergence (Bearish)', patternType:'bearish', symbol:'BANKNIFTY',  sector:'Index',   ltp: 50124.00, change: -0.88, timeframe:'H' },
  { id: 23, date:'2025-01-13', signalName:'Bullish Harami',           patternType:'bullish', symbol:'AXISBANK',   sector:'Banking', ltp:  1072.55, change:  1.33, timeframe:'D' },
  { id: 24, date:'2025-01-13', signalName:'Three Black Crows',        patternType:'bearish', symbol:'BAJFINANCE', sector:'Banking', ltp:  6878.00, change: -2.70, timeframe:'W' },
  { id: 25, date:'2025-01-13', signalName:'Dragonfly Doji',           patternType:'candle',  symbol:'MARUTI',     sector:'Auto',    ltp: 11050.00, change:  0.08, timeframe:'D' },
  { id: 26, date:'2025-01-10', signalName:'Cup & Handle',             patternType:'bullish', symbol:'DRREDDY',    sector:'Pharma',  ltp:  1250.20, change:  0.67, timeframe:'W' },
  { id: 27, date:'2025-01-10', signalName:'Head & Shoulders',         patternType:'bearish', symbol:'ICICIBANK',  sector:'Banking', ltp:  1218.40, change: -1.34, timeframe:'D' },
  { id: 28, date:'2025-01-10', signalName:'SMA Breakout (200)',       patternType:'ma',      symbol:'TATAMOTORS', sector:'Auto',    ltp:   865.00, change:  0.45, timeframe:'M' },
  { id: 29, date:'2025-01-10', signalName:'Gravestone Doji',          patternType:'candle',  symbol:'INFY',       sector:'IT',      ltp:  1901.30, change: -0.52, timeframe:'H' },
  { id: 30, date:'2025-01-09', signalName:'Rising Three Methods',     patternType:'bullish', symbol:'HDFCBANK',   sector:'Banking', ltp:  1672.00, change:  1.75, timeframe:'D' },
  { id: 31, date:'2025-01-09', signalName:'Falling Three Methods',    patternType:'bearish', symbol:'NIFTY',      sector:'Index',   ltp: 23100.00, change: -1.05, timeframe:'D' },
  { id: 32, date:'2025-01-09', signalName:'Bearish Marubozu',         patternType:'bearish', symbol:'RELIANCE',   sector:'Energy',  ltp:  2798.00, change: -2.34, timeframe:'D' },
  { id: 33, date:'2025-01-08', signalName:'Bullish Belt Hold',        patternType:'bullish', symbol:'SUNPHARMA',  sector:'Pharma',  ltp:  1595.00, change:  1.88, timeframe:'D' },
  { id: 34, date:'2025-01-08', signalName:'Long-Legged Doji',         patternType:'candle',  symbol:'HCLTECH',    sector:'IT',      ltp:  1768.40, change:  0.02, timeframe:'H' },
];

/* ── helpers ────────────────────────────────────────────────── */
function patternIcon(t: PatternType): string {
  if (t === 'bullish') return '📈';
  if (t === 'bearish') return '📉';
  if (t === 'ma')      return '〰️';
  return '🕯️';
}
function patternLabel(t: PatternType): string {
  if (t === 'bullish') return 'Bullish';
  if (t === 'bearish') return 'Bearish';
  if (t === 'ma')      return 'Moving Avg';
  return 'Candlestick';
}
function patternColor(t: PatternType): string {
  if (t === 'bullish') return CE_COLOR;
  if (t === 'bearish') return PE_COLOR;
  if (t === 'ma')      return '#f59e0b';
  return '#a5b4fc';
}

/* ── page ───────────────────────────────────────────────────── */
export function CandlestickPage() {
  const [selTfs,   setSelTfs]   = useState<Set<TF>>(new Set(['H', 'D', 'W', 'M']));
  const [sigType,  setSigType]  = useState<SignalType>('All');
  const [sector,   setSector]   = useState<Sector>('All');
  const [applied,  setApplied]  = useState<{
    tfs: Set<TF>; sigType: SignalType; sector: Sector;
  }>({ tfs: new Set(['H', 'D', 'W', 'M']), sigType: 'All', sector: 'All' });

  function toggleTf(tf: TF) {
    setSelTfs(prev => {
      const next = new Set(prev);
      if (next.has(tf)) { if (next.size > 1) next.delete(tf); }
      else next.add(tf);
      return next;
    });
  }

  const filtered = useMemo(
    () => MOCK_SIGNALS.filter(r =>
      applied.tfs.has(r.timeframe) &&
      TYPE_FILTER[applied.sigType].includes(r.patternType) &&
      (applied.sector === 'All' || r.sector === applied.sector),
    ),
    [applied],
  );

  const pill = (active: boolean, color = CE_COLOR) => ({
    padding: '4px 12px', borderRadius: 16,
    border: `1px solid ${active ? color : BORDER}`,
    background: active ? `${color}1e` : 'transparent',
    color: active ? color : TEXT_MUTED,
    cursor: 'pointer' as const, fontSize: 12,
    fontWeight: active ? 700 : 400, transition: 'all .15s',
  });

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '20px 24px', color: TEXT, fontFamily: 'inherit' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Candlestick Pattern Signals</h2>

      {/* ── Filter bar ── */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>

        {/* Timeframe checkboxes */}
        <div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeframe</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {TIMEFRAME_KEYS.map(tf => (
              <label key={tf} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={selTfs.has(tf)} onChange={() => toggleTf(tf)}
                  style={{ accentColor: CE_COLOR, width: 14, height: 14, cursor: 'pointer' }} />
                <span style={{ color: selTfs.has(tf) ? TEXT : TEXT_MUTED, fontWeight: selTfs.has(tf) ? 600 : 400 }}>
                  {tf}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Signal type pills */}
        <div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal Type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SIGNAL_TYPES.map(st => (
              <button key={st} onClick={() => setSigType(st)} style={pill(sigType === st)}>{st}</button>
            ))}
          </div>
        </div>

        {/* Sector */}
        <div>
          <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sector</div>
          <select value={sector} onChange={e => setSector(e.target.value as Sector)}
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, padding: '6px 12px', fontSize: 13, cursor: 'pointer', minWidth: 120 }}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button onClick={() => setApplied({ tfs: new Set(selTfs), sigType, sector })}
          style={{ padding: '7px 26px', borderRadius: 8, border: 'none', background: CE_COLOR, color: '#0f1117', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Apply
        </button>
      </div>

      {/* Result count */}
      <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 12 }}>
        Showing <strong style={{ color: TEXT }}>{filtered.length}</strong> of {MOCK_SIGNALS.length} signals
      </div>

      {/* ── Table ── */}
      <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['Date', 'Signal Name', 'Pattern Type', 'Stock / Symbol', 'LTP', 'Change %', 'Timeframe'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: TEXT_MUTED, fontWeight: 600, whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.016)' }}>
                  <td style={{ padding: '9px 14px', color: TEXT_MUTED, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.date}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: 6 }}>{patternIcon(row.patternType)}</span>
                    {row.signalName}
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ color: patternColor(row.patternType), fontWeight: 500 }}>{patternLabel(row.patternType)}</span>
                  </td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.02em' }}>{row.symbol}</td>
                  <td style={{ padding: '9px 14px', fontVariantNumeric: 'tabular-nums' }}>
                    &#x20b9;{row.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '9px 14px', color: row.change >= 0 ? CE_COLOR : PE_COLOR, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                  </td>
                  <td style={{ padding: '9px 14px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${TF_COLOR[row.timeframe]}22`, color: TF_COLOR[row.timeframe], border: `1px solid ${TF_COLOR[row.timeframe]}44` }}>
                      {TF_LABEL[row.timeframe]}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 0', textAlign: 'center', color: TEXT_MUTED, fontSize: 14 }}>
                    No signals match the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
