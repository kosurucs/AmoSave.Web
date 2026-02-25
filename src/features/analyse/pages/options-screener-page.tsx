import { useState, useMemo } from 'react';

type OiAction = 'Long Buildup' | 'Short Cover' | 'Long Unwind' | 'Short Buildup';
type Sector = 'All Sectors' | 'IT' | 'Banking' | 'Auto' | 'Pharma' | 'Energy' | 'FMCG';
type Expiry = 'nearest' | 'next' | 'monthly';
type SortField = 'change' | 'atmIv' | 'oi' | 'ivp';

interface Stock {
  symbol: string;
  sector: Exclude<Sector, 'All Sectors'>;
  futPrice: number;
  change: number;
  atmIv: number;
  ivp: number;
  oiAction: OiAction;
  high52w: number;
  low52w: number;
}

const MOCK_STOCKS: Stock[] = [
  { symbol: 'RELIANCE',   sector: 'Energy',   futPrice: 2845, change:  1.2,  atmIv: 18.5, ivp: 45, oiAction: 'Long Buildup',  high52w: 3024, low52w: 2220 },
  { symbol: 'TCS',        sector: 'IT',       futPrice: 3920, change: -0.8,  atmIv: 15.2, ivp: 32, oiAction: 'Short Cover',    high52w: 4255, low52w: 3305 },
  { symbol: 'HDFCBANK',   sector: 'Banking',  futPrice: 1680, change:  0.5,  atmIv: 22.1, ivp: 58, oiAction: 'Short Buildup',  high52w: 1795, low52w: 1363 },
  { symbol: 'INFY',       sector: 'IT',       futPrice: 1455, change: -1.4,  atmIv: 17.8, ivp: 28, oiAction: 'Long Unwind',    high52w: 1955, low52w: 1310 },
  { symbol: 'ICICIBANK',  sector: 'Banking',  futPrice: 1095, change:  2.1,  atmIv: 20.3, ivp: 62, oiAction: 'Long Buildup',  high52w: 1196, low52w:  849 },
  { symbol: 'SBIN',       sector: 'Banking',  futPrice:  815, change:  0.9,  atmIv: 25.6, ivp: 70, oiAction: 'Long Buildup',  high52w:  912, low52w:  600 },
  { symbol: 'TATAMOTORS', sector: 'Auto',     futPrice:  925, change: -2.3,  atmIv: 30.4, ivp: 55, oiAction: 'Short Buildup',  high52w: 1180, low52w:  635 },
  { symbol: 'MARUTI',     sector: 'Auto',     futPrice: 12500, change: 0.7,  atmIv: 14.9, ivp: 38, oiAction: 'Short Cover',   high52w: 13680, low52w: 9900 },
  { symbol: 'SUNPHARMA',  sector: 'Pharma',   futPrice: 1720, change:  1.8,  atmIv: 19.2, ivp: 48, oiAction: 'Long Buildup',  high52w: 1960, low52w: 1180 },
  { symbol: 'DRREDDY',    sector: 'Pharma',   futPrice: 6850, change: -0.4,  atmIv: 16.5, ivp: 35, oiAction: 'Long Unwind',   high52w: 7620, low52w: 5210 },
  { symbol: 'WIPRO',      sector: 'IT',       futPrice:  475, change: -1.1,  atmIv: 21.0, ivp: 30, oiAction: 'Short Buildup', high52w:  580, low52w:  408 },
  { symbol: 'ONGC',       sector: 'Energy',   futPrice:  285, change:  0.3,  atmIv: 27.8, ivp: 65, oiAction: 'Short Cover',   high52w:  345, low52w:  196 },
  { symbol: 'BPCL',       sector: 'Energy',   futPrice:  368, change:  1.5,  atmIv: 24.3, ivp: 52, oiAction: 'Long Buildup',  high52w:  430, low52w:  270 },
  { symbol: 'AXISBANK',   sector: 'Banking',  futPrice: 1125, change: -0.6,  atmIv: 23.7, ivp: 44, oiAction: 'Long Unwind',   high52w: 1340, low52w:  880 },
  { symbol: 'BAJFINANCE', sector: 'Banking',  futPrice: 7200, change:  2.8,  atmIv: 26.1, ivp: 72, oiAction: 'Long Buildup',  high52w: 8192, low52w: 5600 },
  { symbol: 'HINDUNILVR', sector: 'FMCG',    futPrice: 2310, change: -0.3,  atmIv: 12.4, ivp: 22, oiAction: 'Short Cover',   high52w: 2900, low52w: 2100 },
  { symbol: 'ITC',        sector: 'FMCG',    futPrice:  475, change:  0.6,  atmIv: 13.8, ivp: 40, oiAction: 'Short Cover',   high52w:  528, low52w:  390 },
  { symbol: 'NESTLEIND',  sector: 'FMCG',    futPrice: 22100, change:-0.2,  atmIv: 11.5, ivp: 18, oiAction: 'Long Unwind',  high52w: 26200, low52w: 20200 },
  { symbol: 'TATASTEEL',  sector: 'Energy',   futPrice:  158, change: -3.1,  atmIv: 35.2, ivp: 80, oiAction: 'Short Buildup', high52w:  185, low52w:  118 },
  { symbol: 'M&M',        sector: 'Auto',     futPrice: 2950, change:  1.0,  atmIv: 18.0, ivp: 43, oiAction: 'Long Buildup',  high52w: 3240, low52w: 1960 },
  { symbol: 'HCLTECH',    sector: 'IT',       futPrice: 1620, change: -0.9,  atmIv: 16.8, ivp: 29, oiAction: 'Short Buildup', high52w: 1950, low52w: 1235 },
  { symbol: 'CIPLA',      sector: 'Pharma',   futPrice: 1490, change:  0.4,  atmIv: 17.5, ivp: 41, oiAction: 'Short Cover',   high52w: 1702, low52w: 1153 },
  { symbol: 'DIVISLAB',   sector: 'Pharma',   futPrice: 5600, change: -1.7,  atmIv: 20.8, ivp: 50, oiAction: 'Long Unwind',   high52w: 6210, low52w: 3840 },
];

const OI_BADGE: Record<OiAction, { bg: string; color: string }> = {
  'Long Buildup':  { bg: 'rgba(34,197,94,0.18)',  color: '#22c55e' },
  'Short Cover':   { bg: 'rgba(59,130,246,0.18)', color: '#3b82f6' },
  'Long Unwind':   { bg: 'rgba(251,146,60,0.18)', color: '#fb923c' },
  'Short Buildup': { bg: 'rgba(239,68,68,0.18)',  color: '#ef4444' },
};

function tileColor(change: number): string {
  const intensity = Math.min(Math.abs(change) / 4, 1);
  const r = change < 0 ? Math.round(180 * intensity) : 20;
  const g = change > 0 ? Math.round(160 * intensity) : 20;
  return `rgb(${r + 20}, ${g + 20}, 30)`;
}

function IvpBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 64, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: value > 70 ? 'var(--danger)' : value > 40 ? '#f59e0b' : 'var(--success)' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 28 }}>{value}</span>
    </div>
  );
}

export function OptionsScreenerPage() {
  const [view, setView] = useState<'table' | 'heatmap'>('table');
  const [sector, setSector] = useState<Sector>('All Sectors');
  const [expiry, setExpiry] = useState<Expiry>('nearest');
  const [liquidOnly, setLiquidOnly] = useState(false);
  const [oiFilters, setOiFilters] = useState<Record<OiAction, boolean>>({
    'Long Buildup': false, 'Short Cover': false, 'Long Unwind': false, 'Short Buildup': false,
  });
  const [ivMin, setIvMin] = useState(0);
  const [ivMax, setIvMax] = useState(100);
  const [sortField, setSortField] = useState<SortField>('change');
  const [activeFilters, setActiveFilters] = useState({ sector: 'All Sectors' as Sector, liquidOnly: false, oiFilters: { 'Long Buildup': false, 'Short Cover': false, 'Long Unwind': false, 'Short Buildup': false } as Record<OiAction, boolean>, ivMin: 0, ivMax: 100 });

  const handleApply = () => setActiveFilters({ sector, liquidOnly, oiFilters: { ...oiFilters }, ivMin, ivMax });

  const filtered = useMemo(() => {
    const anyOi = Object.values(activeFilters.oiFilters).some(Boolean);
    return MOCK_STOCKS.filter(s => {
      if (activeFilters.sector !== 'All Sectors' && s.sector !== activeFilters.sector) return false;
      if (anyOi && !activeFilters.oiFilters[s.oiAction]) return false;
      if (s.atmIv < activeFilters.ivMin || s.atmIv > activeFilters.ivMax) return false;
      return true;
    });
  }, [activeFilters]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortField === 'change') return b.change - a.change;
    if (sortField === 'atmIv') return b.atmIv - a.atmIv;
    if (sortField === 'ivp') return b.ivp - a.ivp;
    return 0;
  }), [filtered, sortField]);

  const sectors: Sector[] = ['All Sectors', 'IT', 'Banking', 'Auto', 'Pharma', 'Energy', 'FMCG'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: 'var(--bg-card)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Options Screener</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Scan F&O stocks by OI action, IV percentile &amp; more</p>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {(['table', 'heatmap'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: view === v ? 'var(--accent)' : 'var(--bg-elevated)', color: view === v ? '#fff' : 'var(--text-muted)', transition: 'all .15s' }}>
              {v === 'table' ? '⊞ Table View' : '▦ Heat Map'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', padding: '16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg-elevated)' }}>
          {/* Sector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value as Sector)} style={{ marginTop: 6, width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13 }}>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Expiry */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>Expiry</label>
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              {(['nearest', 'next', 'monthly'] as Expiry[]).map(e => (
                <button key={e} onClick={() => setExpiry(e)} style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 500, borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', background: expiry === e ? 'var(--accent)' : 'var(--bg-card)', color: expiry === e ? '#fff' : 'var(--text-muted)' }}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Liquid Only */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Liquid Only</span>
            <button onClick={() => setLiquidOnly(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', background: liquidOnly ? 'var(--accent)' : 'var(--border)', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 3, left: liquidOnly ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>

          {/* OI Action */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>OI Action</label>
            <div style={{ marginTop: 8 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>Bullish</p>
              {(['Long Buildup', 'Short Cover'] as OiAction[]).map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                  <input type="checkbox" checked={oiFilters[a]} onChange={e => setOiFilters(f => ({ ...f, [a]: e.target.checked }))} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                  {a}
                </label>
              ))}
              <p style={{ margin: '8px 0 4px', fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Bearish</p>
              {(['Long Unwind', 'Short Buildup'] as OiAction[]).map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
                  <input type="checkbox" checked={oiFilters[a]} onChange={e => setOiFilters(f => ({ ...f, [a]: e.target.checked }))} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* IV Range */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5 }}>IV Range (%)</label>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min</span>
                <input type="number" min={0} max={ivMax} value={ivMin} onChange={e => setIvMin(+e.target.value)} style={{ width: '100%', marginTop: 2, padding: '5px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13 }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max</span>
                <input type="number" min={ivMin} max={100} value={ivMax} onChange={e => setIvMax(+e.target.value)} style={{ width: '100%', marginTop: 2, padding: '5px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13 }} />
              </div>
            </div>
            <input type="range" min={0} max={100} value={ivMin} onChange={e => setIvMin(+e.target.value)} style={{ width: '100%', marginTop: 8, accentColor: 'var(--accent)' }} />
            <input type="range" min={0} max={100} value={ivMax} onChange={e => setIvMax(+e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          <button onClick={handleApply} style={{ width: '100%', padding: '9px 0', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
            Apply Filters
          </button>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {view === 'table' ? (
            <TableView stocks={sorted} />
          ) : (
            <HeatmapView stocks={sorted} sortField={sortField} setSortField={setSortField} />
          )}
        </main>
      </div>
    </div>
  );
}

function TableView({ stocks }: { stocks: Stock[] }) {
  const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 1 };
  const td: React.CSSProperties = { padding: '10px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={th}>Stock</th>
          <th style={{ ...th, textAlign: 'right' }}>Fut. Price</th>
          <th style={{ ...th, textAlign: 'right' }}>Change %</th>
          <th style={{ ...th, textAlign: 'right' }}>ATM IV</th>
          <th style={th}>OI Action</th>
          <th style={th}>IVP</th>
          <th style={{ ...th, textAlign: 'right' }}>52W High</th>
          <th style={{ ...th, textAlign: 'right' }}>52W Low</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map(s => {
          const badge = OI_BADGE[s.oiAction];
          return (
            <tr key={s.symbol} style={{ cursor: 'default' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td style={td}>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.symbol}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.sector}</div>
              </td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₹{s.futPrice.toLocaleString('en-IN')}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: s.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
              </td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.atmIv.toFixed(1)}%</td>
              <td style={td}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>
                  {s.oiAction}
                </span>
              </td>
              <td style={td}><IvpBar value={s.ivp} /></td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>₹{s.high52w.toLocaleString('en-IN')}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>₹{s.low52w.toLocaleString('en-IN')}</td>
            </tr>
          );
        })}
        {stocks.length === 0 && (
          <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No stocks match the selected filters.</td></tr>
        )}
      </tbody>
    </table>
  );
}

function HeatmapView({ stocks, sortField, setSortField }: { stocks: Stock[]; sortField: SortField; setSortField: (f: SortField) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
        {([['change', 'Change %'], ['atmIv', 'ATM IV'], ['oi', 'OI'], ['ivp', 'IVP']] as [SortField, string][]).map(([f, label]) => (
          <button key={f} onClick={() => setSortField(f)} style={{ padding: '4px 12px', borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: sortField === f ? 'var(--accent)' : 'var(--bg-elevated)', color: sortField === f ? '#fff' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgb(200,20,30)', marginRight: 4 }} />Loss&nbsp;&nbsp;
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgb(20,180,30)', marginRight: 4 }} />Gain
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {stocks.map(s => {
          const bg = tileColor(s.change);
          const isHovered = hovered === s.symbol;
          const badge = OI_BADGE[s.oiAction];
          return (
            <div key={s.symbol} onMouseEnter={() => setHovered(s.symbol)} onMouseLeave={() => setHovered(null)} style={{ position: 'relative', width: 140, height: 80, borderRadius: 8, background: bg, border: isHovered ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent', cursor: 'default', padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color .15s', boxSizing: 'border-box' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: .3 }}>{s.symbol}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>₹{s.futPrice.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>IV {s.atmIv.toFixed(1)}%</span>
              </div>
              {isHovered && (
                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, width: 200, background: '#1a1a2e', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', zIndex: 10, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.4)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 6 }}>{s.symbol} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sector}</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Row label="Fut. Price" value={`₹${s.futPrice.toLocaleString('en-IN')}`} />
                    <Row label="Change" value={`${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%`} valueColor={s.change >= 0 ? 'var(--success)' : 'var(--danger)'} />
                    <Row label="ATM IV" value={`${s.atmIv.toFixed(1)}%`} />
                    <Row label="IVP" value={String(s.ivp)} />
                    <div style={{ marginTop: 4 }}><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color }}>{s.oiAction}</span></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {stocks.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No stocks match filters.</p>}
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: valueColor ?? '#fff', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
