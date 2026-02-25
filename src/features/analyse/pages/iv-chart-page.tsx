import { useState, useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface IVDataPoint {
  date: string
  iv: number
  price: number
  isFriday: boolean
  open: number
  high: number
  low: number
  close: number
}

type RangeKey = '1M' | '3M' | '6M' | '1Y' | 'Custom'
type GraphType = 'Line' | 'Candle'

const BASE_PRICES: Record<string, number> = {
  NIFTY: 22500,
  BANKNIFTY: 48000,
  FINNIFTY: 21000,
  SENSEX: 74000,
}

function generateIVData(days: number, symbol: string): IVDataPoint[] {
  const basePrice = BASE_PRICES[symbol.toUpperCase()] ?? 22500
  const result: IVDataPoint[] = []
  const today = new Date()
  let iv = 18
  let price = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue

    iv = Math.max(10, Math.min(45, iv + (Math.random() - 0.5) * 2))
    price = Math.max(
      basePrice * 0.85,
      Math.min(basePrice * 1.15, price + (Math.random() - 0.48) * basePrice * 0.006),
    )

    const open = price + (Math.random() - 0.5) * basePrice * 0.004
    const close = price + (Math.random() - 0.5) * basePrice * 0.004

    result.push({
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      iv: parseFloat(iv.toFixed(2)),
      price: Math.round(price),
      isFriday: dow === 5,
      open: Math.round(open),
      high: Math.round(Math.max(open, close) + Math.random() * basePrice * 0.003),
      low: Math.round(Math.min(open, close) - Math.random() * basePrice * 0.003),
      close: Math.round(close),
    })
  }
  return result
}

interface TooltipEntry {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
      }}
    >
      <p style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: '2px 0', color: entry.color }}>
          {entry.name}:{' '}
          {entry.name.includes('IV') ? `${entry.value.toFixed(2)}%` : entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

const RANGES: RangeKey[] = ['1M', '3M', '6M', '1Y', 'Custom']
const RANGE_DAYS: Record<RangeKey, number> = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, Custom: 90 }

export function IvChartPage() {
  const [inputSymbol, setInputSymbol] = useState('NIFTY')
  const [symbol, setSymbol] = useState('NIFTY')
  const [graphType, setGraphType] = useState<GraphType>('Line')
  const [range, setRange] = useState<RangeKey>('3M')

  const data = useMemo(() => generateIVData(RANGE_DAYS[range], symbol), [range, symbol])
  const priceMin = useMemo(() => Math.min(...data.map((d) => d.price)) * 0.995, [data])
  const priceMax = useMemo(() => Math.max(...data.map((d) => d.price)) * 1.005, [data])

  const pillBase: React.CSSProperties = {
    padding: '4px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
  }
  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: 'var(--accent)',
    color: '#fff',
    border: '1px solid var(--accent)',
  }

  // Custom dot renderer for Friday markers on IV line
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fridayDot = (props: any) => {
    const { cx, cy, payload } = props as { cx: number; cy: number; payload: IVDataPoint }
    if (!payload?.isFriday) return <g />
    return <circle cx={cx} cy={cy} r={5} fill="#f4c94a" stroke="var(--bg)" strokeWidth={1.5} />
  }

  // Custom bar shape for candle mode (colored green/red by direction)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleShape = (props: any) => {
    const { x, y, width, height, payload } = props as {
      x: number
      y: number
      width: number
      height: number
      payload: IVDataPoint
    }
    const color = payload?.close >= payload?.open ? '#22c55e' : '#ef4444'
    return <rect x={x} y={y} width={Math.max(width, 2)} height={Math.max(Math.abs(height), 1)} fill={color} opacity={0.85} rx={1} />
  }

  return (
    <div style={{ padding: 24, color: 'var(--text)' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Implied Volatility Chart</h2>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Symbol search */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSymbol(inputSymbol.trim().toUpperCase() || 'NIFTY')
          }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            placeholder="Symbol (e.g. NIFTY)"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text)',
              fontSize: 14,
              width: 160,
              outline: 'none',
            }}
          />
          <button type="submit" style={{ ...pillBase, color: 'var(--text)' }}>
            Search
          </button>
        </form>

        {/* Graph type toggle */}
        <div
          style={{
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {(['Line', 'Candle'] as GraphType[]).map((g) => (
            <button
              key={g}
              onClick={() => setGraphType(g)}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: graphType === g ? 'var(--accent)' : 'var(--bg-card)',
                color: graphType === g ? '#fff' : 'var(--text-muted)',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Date range pills */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} style={range === r ? pillActive : pillBase}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 8px 8px',
        }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 10, right: 70, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              interval={Math.max(1, Math.floor(data.length / 8))}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 80]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: '#f4c94a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[priceMin, priceMax]}
              tickFormatter={(v: number) => v.toLocaleString('en-IN')}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 12, fontSize: 13, color: 'var(--text-muted)' }} />

            {graphType === 'Line' ? (
              <>
                <Area
                  yAxisId="left"
                  dataKey="iv"
                  name="ATM IV"
                  stroke="#f4c94a"
                  strokeWidth={2}
                  fill="#f4c94a"
                  fillOpacity={0.12}
                  dot={fridayDot}
                  activeDot={{ r: 4, fill: '#f4c94a' }}
                />
                <Line
                  yAxisId="right"
                  dataKey="price"
                  name={`${symbol} Price`}
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#60a5fa' }}
                />
              </>
            ) : (
              <>
                <Bar
                  yAxisId="right"
                  dataKey="close"
                  name={`${symbol} Price`}
                  shape={candleShape}
                  maxBarSize={8}
                />
                <Line
                  yAxisId="left"
                  dataKey="iv"
                  name="ATM IV"
                  stroke="#f4c94a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f4c94a' }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend note ── */}
      <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>
          <span style={{ color: '#60a5fa' }}>■</span> {symbol} Price (right axis)
        </span>
        <span>
          <span style={{ color: '#f4c94a' }}>■</span> ATM IV % (left axis)
        </span>
        <span>
          <span style={{ color: '#f4c94a' }}>●</span> Friday close
        </span>
      </div>
    </div>
  )
}
