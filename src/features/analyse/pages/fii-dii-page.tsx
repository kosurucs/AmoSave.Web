import { useState, useMemo } from 'react'

interface IndexFutureRow {
  category: string
  buyValue: number
  sellValue: number
  netValue: number
  oiChange: number
}

interface IndexOptionRow {
  category: string
  buyValue: number
  sellValue: number
  netValue: number
  callOI: number
  putOI: number
  pcr: number
}

interface StockFutureRow {
  category: string
  buyValue: number
  sellValue: number
  netValue: number
  oiLongPct: number
  oiShortPct: number
}

function rand(base: number, spread: number): number {
  return Math.round((base + (Math.random() - 0.5) * spread) * 100) / 100
}

function buildIndexFutures(): IndexFutureRow[] {
  const rows: Omit<IndexFutureRow, 'netValue'>[] = [
    { category: 'FII',    buyValue: rand(65000, 4000), sellValue: rand(68000, 4000), oiChange: rand(14000, 3000) },
    { category: 'DII',    buyValue: rand(8200,  800),  sellValue: rand(7800,  800),  oiChange: rand(-1800, 600) },
    { category: 'PRO',    buyValue: rand(45000, 3000), sellValue: rand(43000, 3000), oiChange: rand(5200,  1200) },
    { category: 'CLIENT', buyValue: rand(120000,6000), sellValue: rand(122000,6000), oiChange: rand(-17000,4000) },
  ]
  return rows.map((r) => ({ ...r, netValue: Math.round((r.buyValue - r.sellValue) * 100) / 100 }))
}

function buildIndexOptions(): IndexOptionRow[] {
  const rows: Omit<IndexOptionRow, 'netValue' | 'pcr'>[] = [
    { category: 'FII', buyValue: rand(280000,15000), sellValue: rand(295000,15000), callOI: rand(180000,10000), putOI: rand(210000,10000) },
    { category: 'DII', buyValue: rand(12000,  2000), sellValue: rand(11000,  2000), callOI: rand(8000,   1000), putOI: rand(9500,   1000) },
  ]
  return rows.map((r) => ({
    ...r,
    netValue: Math.round((r.buyValue - r.sellValue) * 100) / 100,
    pcr: parseFloat((r.putOI / r.callOI).toFixed(2)),
  }))
}

function buildStockFutures(): StockFutureRow[] {
  const rows: Omit<StockFutureRow, 'netValue'>[] = [
    { category: 'FII',    buyValue: rand(35000,3000), sellValue: rand(33000,3000), oiLongPct: rand(38,4), oiShortPct: rand(28,4) },
    { category: 'DII',    buyValue: rand(5500, 800),  sellValue: rand(5200, 800),  oiLongPct: rand(12,2), oiShortPct: rand(9, 2) },
    { category: 'PRO',    buyValue: rand(22000,2000), sellValue: rand(21000,2000), oiLongPct: rand(22,3), oiShortPct: rand(25,3) },
    { category: 'CLIENT', buyValue: rand(68000,5000), sellValue: rand(70000,5000), oiLongPct: rand(28,4), oiShortPct: rand(38,4) },
  ]
  return rows.map((r) => ({ ...r, netValue: Math.round((r.buyValue - r.sellValue) * 100) / 100 }))
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function NetCell({ value }: { value: number }) {
  return (
    <td
      style={{
        padding: '10px 14px',
        textAlign: 'right',
        fontWeight: 600,
        color: value >= 0 ? 'var(--success)' : 'var(--danger)',
      }}
    >
      {value >= 0 ? '+' : ''}{fmt(value)}
    </td>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'right',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}
const thLeftStyle: React.CSSProperties = { ...thStyle, textAlign: 'left' }

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'right',
  fontSize: 13,
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
}
const tdLeftStyle: React.CSSProperties = { ...tdStyle, textAlign: 'left', fontWeight: 600 }

const tableWrap: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 28,
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--text)',
        background: 'var(--bg-elevated)',
      }}
    >
      {title}
    </div>
  )
}

export function FiiDiiPage() {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const indexFutures  = useMemo(buildIndexFutures,  [])
  const indexOptions  = useMemo(buildIndexOptions,  [])
  const stockFutures  = useMemo(buildStockFutures,  [])

  return (
    <div style={{ padding: 24, color: 'var(--text)', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>FII / DII Institutional Data</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{today}</span>
      </div>

      {/* ── Section 1: Index Futures ── */}
      <div style={tableWrap}>
        <SectionHeader title="Index Futures" />
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thLeftStyle}>Category</th>
              <th style={thStyle}>Buy Value (Cr)</th>
              <th style={thStyle}>Sell Value (Cr)</th>
              <th style={thStyle}>Net Value (Cr)</th>
              <th style={thStyle}>OI Change</th>
            </tr>
          </thead>
          <tbody>
            {indexFutures.map((row) => (
              <tr key={row.category}>
                <td style={tdLeftStyle}>{row.category}</td>
                <td style={tdStyle}>{fmt(row.buyValue)}</td>
                <td style={tdStyle}>{fmt(row.sellValue)}</td>
                <NetCell value={row.netValue} />
                <td style={{ ...tdStyle, color: row.oiChange >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {row.oiChange >= 0 ? '+' : ''}{fmt(row.oiChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Section 2: Index Options ── */}
      <div style={tableWrap}>
        <SectionHeader title="Index Options" />
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thLeftStyle}>Category</th>
              <th style={thStyle}>Buy Value (Cr)</th>
              <th style={thStyle}>Sell Value (Cr)</th>
              <th style={thStyle}>Net Value (Cr)</th>
              <th style={thStyle}>Call OI</th>
              <th style={thStyle}>Put OI</th>
              <th style={thStyle}>PCR</th>
            </tr>
          </thead>
          <tbody>
            {indexOptions.map((row) => (
              <tr key={row.category}>
                <td style={tdLeftStyle}>{row.category}</td>
                <td style={tdStyle}>{fmt(row.buyValue)}</td>
                <td style={tdStyle}>{fmt(row.sellValue)}</td>
                <NetCell value={row.netValue} />
                <td style={tdStyle}>{fmt(row.callOI)}</td>
                <td style={tdStyle}>{fmt(row.putOI)}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 600,
                    color: row.pcr > 1 ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {row.pcr.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Section 3: Stock Futures ── */}
      <div style={tableWrap}>
        <SectionHeader title="Stock Futures" />
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thLeftStyle}>Category</th>
              <th style={thStyle}>Buy Value (Cr)</th>
              <th style={thStyle}>Sell Value (Cr)</th>
              <th style={thStyle}>Net Value (Cr)</th>
              <th style={thStyle}>OI Long %</th>
              <th style={thStyle}>OI Short %</th>
            </tr>
          </thead>
          <tbody>
            {stockFutures.map((row) => (
              <tr key={row.category}>
                <td style={tdLeftStyle}>{row.category}</td>
                <td style={tdStyle}>{fmt(row.buyValue)}</td>
                <td style={tdStyle}>{fmt(row.sellValue)}</td>
                <NetCell value={row.netValue} />
                <td style={{ ...tdStyle, color: 'var(--success)' }}>{row.oiLongPct.toFixed(1)}%</td>
                <td style={{ ...tdStyle, color: 'var(--danger)' }}>{row.oiShortPct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
