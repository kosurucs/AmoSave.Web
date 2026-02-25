import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { optionsService } from '@/services/api/options.service';
import type { Dictionary } from '@/shared/types/api';

/* ─── constants ────────────────────────────────────────────── */
const UNDERLYINGS = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];
const CE_COLOR = '#35d18a';
const PE_COLOR = '#f06161';
const MAX_PAIN_COLOR = '#f59e0b';
const BG = '#0f1117';
const SURFACE = '#1a1d2e';
const BORDER = '#2a2d3e';
const TEXT = '#e2e8f0';
const TEXT_MUTED = '#64748b';

/* ─── types ─────────────────────────────────────────────────── */
interface StrikeRow {
  strike: number;
  ceOi: number;
  peOi: number;
  ceOiChg: number;
  peOiChg: number;
  pcr: number;
}

/* ─── helpers ───────────────────────────────────────────────── */
function toLakhs(v: number) {
  return Math.round(v / 100_000);
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v) || 0;
  return 0;
}

/** Parse the chain Dictionary into StrikeRow[].
 *  Supports both array and map (keyed by strike) formats. */
function parseChain(data: Dictionary): StrikeRow[] {
  if (!data) return [];

  // Array format: [{strike, CE:{openInterest,changeInOI}, PE:{...}}]
  if (Array.isArray(data)) {
    return (data as Dictionary[]).map((row) => {
      const ce = (row['CE'] ?? row['ce'] ?? {}) as Dictionary;
      const pe = (row['PE'] ?? row['pe'] ?? {}) as Dictionary;
      const strike = num(row['strikePrice'] ?? row['strike'] ?? row['Strike']);
      return {
        strike,
        ceOi: num(ce['openInterest'] ?? ce['oi'] ?? ce['OI']),
        peOi: num(pe['openInterest'] ?? pe['oi'] ?? pe['OI']),
        ceOiChg: num(ce['changeInOI'] ?? ce['oiChange'] ?? ce['OiChange'] ?? ce['change_in_oi']),
        peOiChg: num(pe['changeInOI'] ?? pe['oiChange'] ?? pe['OiChange'] ?? pe['change_in_oi']),
        pcr: 0,
      };
    });
  }

  // Map format: { "25000": { CE:{...}, PE:{...} } }
  const rows: StrikeRow[] = Object.entries(data).map(([key, val]) => {
    const v = val as Dictionary;
    const ce = (v['CE'] ?? v['ce'] ?? {}) as Dictionary;
    const pe = (v['PE'] ?? v['pe'] ?? {}) as Dictionary;
    return {
      strike: parseFloat(key),
      ceOi: num(ce['openInterest'] ?? ce['oi'] ?? ce['OI']),
      peOi: num(pe['openInterest'] ?? pe['oi'] ?? pe['OI']),
      ceOiChg: num(ce['changeInOI'] ?? ce['oiChange'] ?? ce['OiChange'] ?? ce['change_in_oi']),
      peOiChg: num(pe['changeInOI'] ?? pe['oiChange'] ?? pe['OiChange'] ?? pe['change_in_oi']),
      pcr: 0,
    };
  });

  return rows;
}

function withPcr(rows: StrikeRow[]): StrikeRow[] {
  return rows
    .sort((a, b) => a.strike - b.strike)
    .map((r) => ({ ...r, pcr: r.ceOi > 0 ? parseFloat((r.peOi / r.ceOi).toFixed(2)) : 0 }));
}

function extractMaxPain(data: Dictionary): number | null {
  if (!data) return null;
  const mp =
    data['maxPain'] ??
    data['max_pain'] ??
    data['MaxPain'] ??
    data['maxPainStrike'] ??
    data['strike'];
  return mp != null ? num(mp) : null;
}

function extractPcr(data: Dictionary): number | null {
  if (!data) return null;
  const p = data['pcr'] ?? data['PCR'] ?? data['putCallRatio'];
  return p != null ? parseFloat(num(p).toFixed(2)) : null;
}

/* ─── sub-components ─────────────────────────────────────────── */
interface ChgCellProps {
  v: number;
}
function ChgCell({ v }: ChgCellProps) {
  const color = v > 0 ? CE_COLOR : v < 0 ? PE_COLOR : TEXT_MUTED;
  return (
    <td style={{ padding: '6px 12px', textAlign: 'right', color, fontVariantNumeric: 'tabular-nums' }}>
      {v > 0 ? '+' : ''}{toLakhs(v)}
    </td>
  );
}

interface OiCellProps {
  v: number;
}
function OiCell({ v }: OiCellProps) {
  return (
    <td style={{ padding: '6px 12px', textAlign: 'right', color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
      {toLakhs(v).toLocaleString()}
    </td>
  );
}

/* ─── custom tooltip ─────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const ce = payload.find((p: { dataKey: string }) => p.dataKey === 'ceOiL');
  const pe = payload.find((p: { dataKey: string }) => p.dataKey === 'peOiL');
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: TEXT_MUTED, marginBottom: 6, fontWeight: 600 }}>Strike {label}</div>
      {ce && <div style={{ color: CE_COLOR }}>CE OI: {Number(ce.value).toLocaleString()}L</div>}
      {pe && <div style={{ color: PE_COLOR }}>PE OI: {Number(pe.value).toLocaleString()}L</div>}
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────── */
export function OpenInterestPage() {
  const [underlying, setUnderlying] = useState('BANKNIFTY');
  const [expiry, setExpiry] = useState('');
  const [rows, setRows] = useState<StrikeRow[]>([]);
  const [maxPain, setMaxPain] = useState<number | null>(null);
  const [pcrValue, setPcrValue] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* expiries query — refetch when underlying changes */
  const { data: expiriesRaw, isLoading: expiriesLoading } = useQuery({
    queryKey: ['expiries', underlying],
    queryFn: () => optionsService.getExpiries(underlying),
  });

  const expiries: string[] = Array.isArray(expiriesRaw) ? (expiriesRaw as string[]) : [];

  /* sync expiry when list changes */
  useEffect(() => {
    if (expiries.length > 0 && !expiries.includes(expiry)) setExpiry(expiries[0]);
  }, [expiries.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstExpiry = expiries[0] ?? '';
  const resolvedExpiry = expiries.includes(expiry) ? expiry : firstExpiry;

  /* load OI mutation */
  const loadMutation = useMutation({
    mutationFn: async () => {
      setLoadError(null);
      const [chainData, maxPainData] = await Promise.allSettled([
        optionsService.getOptionChain({ userId: '', underlying, expiry: resolvedExpiry }),
        optionsService.getMaxPain({ underlying, expiry: resolvedExpiry }),
      ]);

      if (chainData.status === 'fulfilled' && chainData.value) {
        const parsed = withPcr(parseChain(chainData.value as Dictionary));
        setRows(parsed);

        // derive overall PCR from chain
        const totalPe = parsed.reduce((s, r) => s + r.peOi, 0);
        const totalCe = parsed.reduce((s, r) => s + r.ceOi, 0);
        if (totalCe > 0) setPcrValue(parseFloat((totalPe / totalCe).toFixed(2)));
      } else {
        setLoadError('Failed to load option chain data.');
        return;
      }

      if (maxPainData.status === 'fulfilled' && maxPainData.value) {
        const mp = extractMaxPain(maxPainData.value as Dictionary);
        const pcr = extractPcr(maxPainData.value as Dictionary);
        if (mp) setMaxPain(mp);
        if (pcr) setPcrValue(pcr);
      } else {
        // derive max pain from chain
        const chain = withPcr(parseChain((chainData as PromiseFulfilledResult<Dictionary>).value as Dictionary));
        if (chain.length > 0) {
          const totalOiByStrike = chain.map((r) => ({ strike: r.strike, loss: chain.reduce((s, other) => {
            const diff = Math.abs(other.strike - r.strike);
            return s + (other.strike > r.strike ? other.ceOi * diff : other.peOi * diff);
          }, 0) }));
          const minLoss = totalOiByStrike.reduce((a, b) => (a.loss < b.loss ? a : b));
          setMaxPain(minLoss.strike);
        }
      }
    },
  });

  const handleLoad = useCallback(() => {
    if (!resolvedExpiry) return;
    loadMutation.mutate();
  }, [loadMutation, resolvedExpiry]);

  /* chart data */
  const chartData = rows.map((r) => ({
    strike: r.strike,
    ceOiL: toLakhs(r.ceOi),
    peOiL: toLakhs(r.peOi),
  }));

  /* ── render ── */
  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '20px 24px', color: TEXT, fontFamily: 'inherit' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Underlying pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UNDERLYINGS.map((u) => (
            <button
              key={u}
              onClick={() => { setUnderlying(u); setRows([]); setMaxPain(null); setPcrValue(null); }}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: `1px solid ${underlying === u ? CE_COLOR : BORDER}`,
                background: underlying === u ? 'rgba(53,209,138,0.12)' : 'transparent',
                color: underlying === u ? CE_COLOR : TEXT_MUTED,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: underlying === u ? 700 : 400,
                transition: 'all .15s',
              }}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Expiry dropdown */}
        <select
          value={resolvedExpiry}
          onChange={(e) => setExpiry(e.target.value)}
          disabled={expiriesLoading}
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            color: TEXT,
            padding: '6px 12px',
            fontSize: 13,
            cursor: 'pointer',
            minWidth: 130,
          }}
        >
          {expiriesLoading && <option>Loading…</option>}
          {expiries.map((ex: string) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
          {!expiriesLoading && expiries.length === 0 && <option value="">No expiries</option>}
        </select>

        {/* Load button */}
        <button
          onClick={handleLoad}
          disabled={loadMutation.isPending || !resolvedExpiry}
          style={{
            padding: '6px 20px',
            borderRadius: 8,
            border: 'none',
            background: loadMutation.isPending ? BORDER : CE_COLOR,
            color: loadMutation.isPending ? TEXT_MUTED : '#0f1117',
            fontWeight: 700,
            fontSize: 13,
            cursor: loadMutation.isPending ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
          }}
        >
          {loadMutation.isPending ? 'Loading…' : 'Load OI'}
        </button>

        {/* PCR badge */}
        {pcrValue != null && (
          <div style={{
            padding: '5px 14px',
            borderRadius: 20,
            background: pcrValue >= 1 ? 'rgba(53,209,138,0.12)' : 'rgba(240,97,97,0.12)',
            border: `1px solid ${pcrValue >= 1 ? CE_COLOR : PE_COLOR}`,
            color: pcrValue >= 1 ? CE_COLOR : PE_COLOR,
            fontSize: 13,
            fontWeight: 700,
          }}>
            PCR {pcrValue}
          </div>
        )}

        {/* Max Pain badge */}
        {maxPain != null && (
          <div style={{
            padding: '5px 14px',
            borderRadius: 20,
            background: 'rgba(245,158,11,0.12)',
            border: `1px solid ${MAX_PAIN_COLOR}`,
            color: MAX_PAIN_COLOR,
            fontSize: 13,
            fontWeight: 700,
          }}>
            Max Pain {maxPain.toLocaleString()}
          </div>
        )}
      </div>

      {/* ── error ── */}
      {loadError && (
        <div style={{ color: PE_COLOR, background: 'rgba(240,97,97,0.08)', border: `1px solid ${PE_COLOR}`, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          {loadError}
        </div>
      )}

      {/* ── Chart ── */}
      {rows.length > 0 && (
        <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: '20px 16px 12px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 16 }}>
            Open Interest — {underlying} {resolvedExpiry}
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} barGap={1} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis
                dataKey="strike"
                tick={{ fill: TEXT_MUTED, fontSize: 11 }}
                axisLine={{ stroke: BORDER }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: TEXT_MUTED, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}L`}
                width={52}
              />
              <Tooltip content={<OiTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(value) => (
                  <span style={{ color: value === 'ceOiL' ? CE_COLOR : PE_COLOR }}>
                    {value === 'ceOiL' ? 'CE OI' : 'PE OI'}
                  </span>
                )}
              />
              {maxPain != null && (
                <ReferenceLine
                  x={maxPain}
                  stroke={MAX_PAIN_COLOR}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  label={{ value: 'Max Pain', fill: MAX_PAIN_COLOR, fontSize: 11, position: 'top' }}
                />
              )}
              <Bar dataKey="ceOiL" name="ceOiL" fill={CE_COLOR} radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar dataKey="peOiL" name="peOiL" fill={PE_COLOR} radius={[3, 3, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── OI Change Table ── */}
      {rows.length > 0 && (
        <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, padding: '14px 16px 10px', borderBottom: `1px solid ${BORDER}` }}>
            OI Change Analysis
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Strike', 'CE OI (L)', 'CE OI Chg', 'PE OI (L)', 'PE OI Chg', 'PCR'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: TEXT_MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.strike}
                    style={{
                      background: r.strike === maxPain ? 'rgba(245,158,11,0.07)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <td style={{
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: r.strike === maxPain ? 700 : 500,
                      color: r.strike === maxPain ? MAX_PAIN_COLOR : TEXT,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {r.strike.toLocaleString()}
                      {r.strike === maxPain && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: MAX_PAIN_COLOR }}>★</span>
                      )}
                    </td>
                    <OiCell v={r.ceOi} />
                    <ChgCell v={r.ceOiChg} />
                    <OiCell v={r.peOi} />
                    <ChgCell v={r.peOiChg} />
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: r.pcr >= 1 ? CE_COLOR : r.pcr > 0 ? PE_COLOR : TEXT_MUTED, fontVariantNumeric: 'tabular-nums' }}>
                      {r.pcr || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── empty state ── */}
      {rows.length === 0 && !loadMutation.isPending && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: TEXT_MUTED }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, marginBottom: 6 }}>Select an underlying and expiry, then click <strong style={{ color: CE_COLOR }}>Load OI</strong></div>
          <div style={{ fontSize: 13 }}>Open Interest data will appear here</div>
        </div>
      )}
    </div>
  );
}
