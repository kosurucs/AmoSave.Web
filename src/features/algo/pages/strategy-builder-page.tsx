import { useState, useMemo, useEffect, CSSProperties } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { optionsService } from '@/services/api/options.service';
import type { Dictionary } from '@/shared/types/api';

// ── Constants ────────────────────────────────────────────────────────────────
const UNDERLYINGS = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY'];
const LOT_SIZE: Record<string, number> = { BANKNIFTY: 15, NIFTY: 75, FINNIFTY: 40, MIDCPNIFTY: 50 };
const STRIKE_STEP: Record<string, number> = { BANKNIFTY: 100, NIFTY: 50, FINNIFTY: 50, MIDCPNIFTY: 25 };
const DEFAULT_ATM: Record<string, number> = { BANKNIFTY: 52000, NIFTY: 24000, FINNIFTY: 23000, MIDCPNIFTY: 12000 };

// ── Types ────────────────────────────────────────────────────────────────────
type LegSide = 'CE' | 'PE';
type LegDir = 'B' | 'S';

interface Leg {
  id: number;
  strike: number;
  side: LegSide;
  dir: LegDir;
  lots: number;
  ltp: number;
  iv: number;
  delta: number;
  theta: number;
}

interface PayoffPoint {
  price: number;
  pnl: number;
  pnlPos: number;
  pnlNeg: number;
}

interface LegTemplate { side: LegSide; dir: LegDir; offset: number; lots: number }

// ── Preset strategy templates (offset = # of strike steps from ATM) ──────────
const PRESETS: Record<string, LegTemplate[]> = {
  'Straddle':         [{ side: 'CE', dir: 'S', offset:  0, lots: 1 }, { side: 'PE', dir: 'S', offset:  0, lots: 1 }],
  'Strangle':         [{ side: 'CE', dir: 'S', offset:  1, lots: 1 }, { side: 'PE', dir: 'S', offset: -1, lots: 1 }],
  'Iron Condor':      [{ side: 'PE', dir: 'B', offset: -2, lots: 1 }, { side: 'PE', dir: 'S', offset: -1, lots: 1 },
                       { side: 'CE', dir: 'S', offset:  1, lots: 1 }, { side: 'CE', dir: 'B', offset:  2, lots: 1 }],
  'Bull Call Spread': [{ side: 'CE', dir: 'B', offset:  0, lots: 1 }, { side: 'CE', dir: 'S', offset:  1, lots: 1 }],
  'Bear Put Spread':  [{ side: 'PE', dir: 'B', offset:  0, lots: 1 }, { side: 'PE', dir: 'S', offset: -1, lots: 1 }],
  'Bull Put Spread':  [{ side: 'PE', dir: 'S', offset: -1, lots: 1 }, { side: 'PE', dir: 'B', offset: -2, lots: 1 }],
  'Bear Call Spread': [{ side: 'CE', dir: 'S', offset:  1, lots: 1 }, { side: 'CE', dir: 'B', offset:  2, lots: 1 }],
  'Long Call':        [{ side: 'CE', dir: 'B', offset:  0, lots: 1 }],
  'Long Put':         [{ side: 'PE', dir: 'B', offset:  0, lots: 1 }],
  'Covered Call':     [{ side: 'CE', dir: 'B', offset:  0, lots: 1 }, { side: 'CE', dir: 'S', offset:  1, lots: 1 }],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
let _legId = 0;
function mkLeg(strike: number, side: LegSide, dir: LegDir, lots = 1, ltp = 0, iv = 0, delta = 0, theta = 0): Leg {
  return { id: ++_legId, strike, side, dir, lots, ltp, iv, delta, theta };
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function computeLegPnl(leg: Leg, spot: number, lotSize: number): number {
  const intrinsic = leg.side === 'CE'
    ? Math.max(0, spot - leg.strike)
    : Math.max(0, leg.strike - spot);
  const perUnit = leg.dir === 'B' ? intrinsic - leg.ltp : leg.ltp - intrinsic;
  return perUnit * leg.lots * lotSize;
}

function extractOpt(row: Dictionary, side: LegSide): Dictionary | null {
  return (side === 'CE' ? row.ce : row.pe) as Dictionary | null;
}

function optField(opt: Dictionary, key: string): number {
  return Number(opt[key] ?? 0);
}

function fmtAxisY(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(Math.round(v));
}

function fmtAxisX(v: number): string {
  if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
  return String(Math.round(v));
}

function fmtINR(v: number): string {
  return '₹' + Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// ── Shared table cell styles ─────────────────────────────────────────────────
const TH: CSSProperties = {
  padding: '6px 10px', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textAlign: 'left',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const TD: CSSProperties = {
  padding: '5px 8px', fontSize: 12,
  borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap',
};

// ── Pill button ───────────────────────────────────────────────────────────────
function Pill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 12px',
        border: active ? `1.5px solid ${color ?? 'var(--accent)'}` : '1.5px solid var(--border)',
        borderRadius: 999,
        cursor: 'pointer',
        fontWeight: active ? 700 : 500,
        fontSize: 12,
        background: active ? `${color ?? 'var(--accent)'}22` : 'transparent',
        color: active ? (color ?? 'var(--accent)') : 'var(--text-muted)',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ── Summary stat row ──────────────────────────────────────────────────────────
function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color ?? 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function StrategyBuilderPage() {
  const [underlying, setUnderlying] = useState('BANKNIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('');
  const [legs, setLegs] = useState<Leg[]>([]);
  const [activePreset, setActivePreset] = useState('');

  // ── API ────────────────────────────────────────────────────────────────────
  const expiriesQuery = useQuery({
    queryKey: ['options', 'expiries', underlying],
    queryFn: () => optionsService.getExpiries(underlying),
  });

  const chainMutation = useMutation({
    mutationFn: (expiry: string) => optionsService.getOptionChain({ userId: '', underlying, expiry }),
  });

  // Auto-load first expiry when underlying changes
  useEffect(() => {
    const exps = expiriesQuery.data;
    if (exps && exps.length > 0) {
      const first = exps[0];
      setSelectedExpiry(first);
      chainMutation.mutate(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiriesQuery.data]);

  // Enrich existing legs with fresh chain data
  useEffect(() => {
    const raw = chainMutation.data as Dictionary | undefined;
    const chain = Array.isArray(raw?.chain) ? (raw.chain as Dictionary[]) : [];
    if (chain.length === 0 || legs.length === 0) return;
    setLegs(prev => prev.map(leg => {
      const row = chain.find(r => Number(r.strikePrice ?? 0) === leg.strike);
      if (!row) return leg;
      const opt = extractOpt(row, leg.side);
      if (!opt) return leg;
      return { ...leg, ltp: optField(opt, 'ltp'), iv: optField(opt, 'iv'), delta: optField(opt, 'delta'), theta: optField(opt, 'theta') };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainMutation.data]);

  // ── Derived chain data ─────────────────────────────────────────────────────
  const chainRaw = chainMutation.data as Dictionary | undefined;
  const chain = Array.isArray(chainRaw?.chain) ? (chainRaw.chain as Dictionary[]) : [];
  const maxPain = Number(chainRaw?.maxPain ?? 0);
  const spotPrice = Number(chainRaw?.underlyingLtp ?? chainRaw?.spot ?? maxPain);

  const atm = useMemo<number>(() => {
    const ref = spotPrice || maxPain;
    if (chain.length === 0 || ref === 0) return DEFAULT_ATM[underlying] ?? 50000;
    return chain.reduce<number>((best, row) => {
      const s = Number(row.strikePrice ?? 0);
      return Math.abs(s - ref) < Math.abs(best - ref) ? s : best;
    }, Number(chain[0]?.strikePrice ?? DEFAULT_ATM[underlying]));
  }, [chain, spotPrice, maxPain, underlying]);

  // ── Payoff calculation ─────────────────────────────────────────────────────
  const payoffData = useMemo<PayoffPoint[]>(() => {
    if (legs.length === 0) return [];
    const center = legs[0].strike;
    const step = STRIKE_STEP[underlying] ?? 50;
    const microStep = step / 4;
    const range = center * 0.15;
    const lotSize = LOT_SIZE[underlying] ?? 1;
    const points: PayoffPoint[] = [];
    for (let price = center - range; price <= center + range + microStep; price += microStep) {
      const rounded = Math.round(price / microStep) * microStep;
      const pnl = legs.reduce((sum, leg) => sum + computeLegPnl(leg, rounded, lotSize), 0);
      points.push({ price: rounded, pnl, pnlPos: Math.max(0, pnl), pnlNeg: Math.min(0, pnl) });
    }
    return points;
  }, [legs, underlying]);

  const breakevens = useMemo<number[]>(() => {
    const bvs: number[] = [];
    for (let i = 1; i < payoffData.length; i++) {
      const prev = payoffData[i - 1];
      const curr = payoffData[i];
      if ((prev.pnl < 0 && curr.pnl >= 0) || (prev.pnl >= 0 && curr.pnl < 0)) {
        const x = prev.price + (curr.price - prev.price) * (-prev.pnl) / (curr.pnl - prev.pnl);
        bvs.push(Math.round(x));
      }
    }
    return bvs;
  }, [payoffData]);

  const summary = useMemo(() => {
    if (payoffData.length === 0 || legs.length === 0) return null;
    const lotSize = LOT_SIZE[underlying] ?? 1;
    const n = payoffData.length;
    const pnlValues = payoffData.map(d => d.pnl);
    const maxPnl = Math.max(...pnlValues);
    const minPnl = Math.min(...pnlValues);
    const rightSlope = payoffData[n - 1].pnl - payoffData[n - 2].pnl;
    const leftSlope = payoffData[1].pnl - payoffData[0].pnl;
    const maxProfitUnlimited = rightSlope > 5 && maxPnl > 0;
    const maxLossUnlimited = (leftSlope < -5 && minPnl < 0) || (rightSlope < -5 && minPnl < 0);
    const totalPremium = legs.reduce((sum, leg) => {
      const sign = leg.dir === 'B' ? -1 : 1;
      return sum + sign * leg.ltp * leg.lots * lotSize;
    }, 0);
    const netDelta = legs.reduce((sum, leg) => sum + (leg.dir === 'B' ? 1 : -1) * leg.delta * leg.lots, 0);
    const netTheta = legs.reduce((sum, leg) => sum + (leg.dir === 'B' ? 1 : -1) * leg.theta * leg.lots, 0);
    return { maxPnl, minPnl, maxProfitUnlimited, maxLossUnlimited, totalPremium, netDelta, netTheta };
  }, [payoffData, legs, underlying]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleUnderlyingChange(u: string) {
    setUnderlying(u);
    setSelectedExpiry('');
    setLegs([]);
    setActivePreset('');
    chainMutation.reset();
  }

  function handleExpiryChange(expiry: string) {
    setSelectedExpiry(expiry);
    if (expiry) chainMutation.mutate(expiry);
  }

  function applyPreset(presetName: string) {
    const templates = PRESETS[presetName];
    if (!templates) return;
    const step = STRIKE_STEP[underlying] ?? 50;
    const atmStrike = roundToStep(atm, step);
    const newLegs = templates.map(t => {
      const strike = atmStrike + t.offset * step;
      let ltp = 0, iv = 0, delta = 0, theta = 0;
      if (chain.length > 0) {
        const row = chain.find(r => Number(r.strikePrice ?? 0) === strike);
        if (row) {
          const opt = extractOpt(row, t.side);
          if (opt) { ltp = optField(opt, 'ltp'); iv = optField(opt, 'iv'); delta = optField(opt, 'delta'); theta = optField(opt, 'theta'); }
        }
      }
      return mkLeg(strike, t.side, t.dir, t.lots, ltp, iv, delta, theta);
    });
    setLegs(newLegs);
    setActivePreset(presetName);
  }

  function addLeg() {
    const step = STRIKE_STEP[underlying] ?? 50;
    setLegs(prev => [...prev, mkLeg(roundToStep(atm, step), 'CE', 'B')]);
    setActivePreset('');
  }

  function updateLeg<K extends keyof Leg>(id: number, key: K, value: Leg[K]) {
    setLegs(prev => prev.map(l => l.id === id ? { ...l, [key]: value } : l));
    setActivePreset('');
  }

  function removeLeg(id: number) {
    setLegs(prev => prev.filter(l => l.id !== id));
    setActivePreset('');
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const expiries = expiriesQuery.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* ── Top bar ── */}
      <div className="page-card" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 16px' }}>
        {/* Underlying pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {UNDERLYINGS.map(u => (
            <Pill key={u} label={u} active={underlying === u} onClick={() => handleUnderlyingChange(u)} />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Expiry */}
        <select
          className="select"
          value={selectedExpiry}
          onChange={e => handleExpiryChange(e.target.value)}
          disabled={expiriesQuery.isLoading}
          style={{ minWidth: 130 }}
        >
          <option value="">{expiriesQuery.isLoading ? 'Loading…' : 'Select expiry'}</option>
          {expiries.map(exp => <option key={exp} value={exp}>{exp}</option>)}
        </select>

        {chainMutation.isPending && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading chain…</span>
        )}

        {spotPrice > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Spot: <b style={{ color: 'var(--text)' }}>₹{spotPrice.toLocaleString('en-IN')}</b>
          </span>
        )}

        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

        {/* Preset pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(name)}
              style={{
                padding: '3px 10px',
                border: activePreset === name ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: activePreset === name ? 700 : 400,
                background: activePreset === name ? 'rgba(44,129,255,0.15)' : 'transparent',
                color: activePreset === name ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.12s',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-panel grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '30% 1fr 30%', gap: 10, alignItems: 'start' }}>

        {/* ── Left panel: Legs ── */}
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>
              Legs {legs.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({legs.length})</span>}
            </span>
            <button className="btn btn-primary" onClick={addLeg} style={{ fontSize: 11, padding: '3px 10px' }}>+ Add Leg</button>
          </div>

          {legs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Select a preset or add legs manually
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Strike', 'Type', 'B/S', 'Lots', 'LTP', 'IV%', 'Δ', 'Θ', ''].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {legs.map(leg => (
                    <tr key={leg.id} style={{ background: 'transparent' }}>
                      <td style={TD}>
                        <input
                          type="number"
                          value={leg.strike}
                          onChange={e => updateLeg(leg.id, 'strike', Number(e.target.value))}
                          style={{ width: 72, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text)', fontSize: 12 }}
                        />
                      </td>
                      <td style={TD}>
                        <select
                          value={leg.side}
                          onChange={e => updateLeg(leg.id, 'side', e.target.value as LegSide)}
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', color: leg.side === 'CE' ? '#35d18a' : '#f06161', fontSize: 12, fontWeight: 700 }}
                        >
                          <option value="CE">CE</option>
                          <option value="PE">PE</option>
                        </select>
                      </td>
                      <td style={TD}>
                        <select
                          value={leg.dir}
                          onChange={e => updateLeg(leg.id, 'dir', e.target.value as LegDir)}
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', color: leg.dir === 'B' ? '#35d18a' : '#f06161', fontSize: 12, fontWeight: 700 }}
                        >
                          <option value="B">B</option>
                          <option value="S">S</option>
                        </select>
                      </td>
                      <td style={TD}>
                        <input
                          type="number"
                          min={1}
                          value={leg.lots}
                          onChange={e => updateLeg(leg.id, 'lots', Math.max(1, Number(e.target.value)))}
                          style={{ width: 44, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px', color: 'var(--text)', fontSize: 12 }}
                        />
                      </td>
                      <td style={{ ...TD, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                        {leg.ltp > 0 ? leg.ltp.toFixed(1) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ ...TD, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {leg.iv > 0 ? leg.iv.toFixed(1) : '—'}
                      </td>
                      <td style={{ ...TD, color: leg.delta >= 0 ? '#35d18a' : '#f06161', fontVariantNumeric: 'tabular-nums' }}>
                        {leg.delta !== 0 ? (leg.dir === 'B' ? '' : '-') + Math.abs(leg.delta).toFixed(2) : '—'}
                      </td>
                      <td style={{ ...TD, color: '#f06161', fontVariantNumeric: 'tabular-nums' }}>
                        {leg.theta !== 0 ? leg.theta.toFixed(1) : '—'}
                      </td>
                      <td style={TD}>
                        <button
                          type="button"
                          onClick={() => removeLeg(leg.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: '0 4px', lineHeight: 1 }}
                          title="Remove leg"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Premium summary under table */}
          {legs.length > 0 && summary && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Net Premium:{' '}
                <b style={{ color: summary.totalPremium >= 0 ? '#35d18a' : '#f06161' }}>
                  {summary.totalPremium >= 0 ? '+' : ''}{fmtINR(summary.totalPremium)}
                </b>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Lot: <b style={{ color: 'var(--text)' }}>{LOT_SIZE[underlying]}</b>
              </span>
            </div>
          )}
        </div>

        {/* ── Center panel: Payoff diagram ── */}
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Payoff Diagram</span>
            {breakevens.length > 0 && (
              <span style={{ marginLeft: 12, fontSize: 11, color: '#f5a623' }}>
                BE: {breakevens.map(b => b.toLocaleString('en-IN')).join(' / ')}
              </span>
            )}
          </div>

          <div style={{ height: 320, padding: '12px 4px 4px 0' }}>
            {payoffData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Add legs to see the payoff diagram
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={payoffData} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#35d18a" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#35d18a" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="gradLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f06161" stopOpacity={0.04} />
                      <stop offset="95%" stopColor="#f06161" stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="price"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickCount={7}
                    tickFormatter={fmtAxisX}
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtAxisY}
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    width={46}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                    labelFormatter={(label: unknown) => `Price: ₹${Number(label).toLocaleString('en-IN')}`}
                    formatter={(value: number | string | (number | string)[] | undefined) => fmtINR(Number(value ?? 0))}
                  />
                  {/* Zero line */}
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                  {/* Current spot */}
                  {spotPrice > 0 && (
                    <ReferenceLine
                      x={spotPrice}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth={1.5}
                      label={{ value: 'Spot', position: 'top', fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
                    />
                  )}
                  {/* Breakeven lines */}
                  {breakevens.map(be => (
                    <ReferenceLine
                      key={be}
                      x={be}
                      stroke="#f5a623"
                      strokeDasharray="5 4"
                      strokeWidth={1.5}
                      label={{ value: `BE`, position: 'insideTopLeft', fontSize: 9, fill: '#f5a623' }}
                    />
                  ))}
                  {/* Profit zone (above zero) */}
                  <Area
                    type="monotone"
                    dataKey="pnlPos"
                    stroke="#35d18a"
                    strokeWidth={2}
                    fill="url(#gradProfit)"
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 3, fill: '#35d18a' }}
                  />
                  {/* Loss zone (below zero) */}
                  <Area
                    type="monotone"
                    dataKey="pnlNeg"
                    stroke="#f06161"
                    strokeWidth={2}
                    fill="url(#gradLoss)"
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 3, fill: '#f06161' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Right panel: Strategy summary ── */}
        <div className="page-card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
            Strategy Summary
          </div>

          {!summary ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Add legs to see summary
            </div>
          ) : (
            <>
              <StatRow
                label="Max Profit"
                value={summary.maxProfitUnlimited ? 'Unlimited ∞' : fmtINR(summary.maxPnl)}
                color="#35d18a"
              />
              <StatRow
                label="Max Loss"
                value={summary.maxLossUnlimited ? 'Unlimited ∞' : fmtINR(summary.minPnl)}
                color="#f06161"
              />
              {breakevens.length > 0 && (
                <StatRow
                  label={breakevens.length > 1 ? 'Breakevens' : 'Breakeven'}
                  value={breakevens.map(b => b.toLocaleString('en-IN')).join(' / ')}
                  color="#f5a623"
                />
              )}
              <StatRow
                label="Net Premium"
                value={(summary.totalPremium >= 0 ? '+' : '') + fmtINR(summary.totalPremium)}
                color={summary.totalPremium >= 0 ? '#35d18a' : '#f06161'}
              />
              <div style={{ marginTop: 14, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Greeks (per lot)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Net Δ Delta', value: summary.netDelta.toFixed(3), color: summary.netDelta >= 0 ? '#35d18a' : '#f06161' },
                    { label: 'Net Θ Theta', value: summary.netTheta.toFixed(2), color: '#f06161' },
                  ].map(g => (
                    <div key={g.label} style={{ background: 'var(--bg-elevated)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{g.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: g.color, fontVariantNumeric: 'tabular-nums' }}>{g.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legs breakdown */}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                {legs.map(leg => (
                  <div key={leg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>
                      <span style={{ color: leg.dir === 'B' ? '#35d18a' : '#f06161', fontWeight: 700 }}>{leg.dir}</span>
                      {' '}{leg.lots}× {leg.strike} {leg.side}
                    </span>
                    <span style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                      {leg.ltp > 0 ? `₹${leg.ltp.toFixed(1)}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
