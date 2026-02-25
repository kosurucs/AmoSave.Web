import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Impact = 'High' | 'Medium' | 'Low'
type TabKey = 'economic' | 'results' | 'holidays'

interface EconEvent {
  date: string
  country: string
  event: string
  impact: Impact
  expected: string
  actual: string
  previous: string
  upcoming: boolean
}

interface ResultsEvent {
  date: string
  company: string
  exchange: string
  eventType: string
  epsExpected: string
  epsActual: string
  thisWeek: boolean
}

interface HolidayEvent {
  date: string
  exchange: string
  name: string
  type: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ECON_EVENTS: EconEvent[] = [
  { date: '07 Jan 2025', country: 'India',  event: 'RBI MPC Meeting (Day 1)',           impact: 'High',   expected: '--',      actual: '--',     previous: '--',    upcoming: true  },
  { date: '08 Jan 2025', country: 'India',  event: 'RBI MPC Rate Decision',             impact: 'High',   expected: '6.50%',   actual: '--',     previous: '6.50%', upcoming: true  },
  { date: '10 Jan 2025', country: 'US',     event: 'Non-Farm Payrolls',                 impact: 'High',   expected: '160K',    actual: '--',     previous: '227K',  upcoming: true  },
  { date: '15 Jan 2025', country: 'US',     event: 'CPI Inflation (YoY)',               impact: 'High',   expected: '2.9%',    actual: '--',     previous: '2.7%',  upcoming: true  },
  { date: '20 Jan 2025', country: 'US',     event: 'FOMC Minutes',                      impact: 'High',   expected: '--',      actual: '--',     previous: '--',    upcoming: true  },
  { date: '22 Jan 2025', country: 'India',  event: 'India WPI Inflation',               impact: 'Medium', expected: '2.4%',    actual: '--',     previous: '1.89%', upcoming: true  },
  { date: '30 Jan 2025', country: 'US',     event: 'US GDP Q4 Advance Estimate',        impact: 'High',   expected: '2.6%',    actual: '--',     previous: '3.1%',  upcoming: true  },
  { date: '01 Feb 2025', country: 'India',  event: 'Union Budget 2025-26',              impact: 'High',   expected: '--',      actual: '--',     previous: '--',    upcoming: true  },
  { date: '14 Nov 2024', country: 'India',  event: 'India CPI Inflation',               impact: 'High',   expected: '5.8%',    actual: '6.21%',  previous: '5.49%', upcoming: false },
  { date: '12 Nov 2024', country: 'US',     event: 'US CPI MoM',                       impact: 'High',   expected: '0.2%',    actual: '0.3%',   previous: '0.2%',  upcoming: false },
  { date: '01 Nov 2024', country: 'India',  event: 'India PMI Manufacturing',           impact: 'Medium', expected: '57.0',    actual: '56.5',   previous: '56.5',  upcoming: false },
  { date: '25 Oct 2024', country: 'India',  event: 'India GDP Q2 FY25',                impact: 'High',   expected: '6.5%',    actual: '5.4%',   previous: '6.7%',  upcoming: false },
  { date: '18 Dec 2024', country: 'US',     event: 'FOMC Rate Decision',                impact: 'High',   expected: '4.25-4.50%', actual: '4.25-4.50%', previous: '4.50-4.75%', upcoming: false },
  { date: '06 Dec 2024', country: 'US',     event: 'Non-Farm Payrolls',                 impact: 'High',   expected: '200K',    actual: '227K',   previous: '36K',   upcoming: false },
  { date: '22 Jan 2025', country: 'US',     event: 'Initial Jobless Claims',            impact: 'Medium', expected: '215K',    actual: '--',     previous: '217K',  upcoming: true  },
]

const RESULTS_EVENTS: ResultsEvent[] = [
  { date: '13 Jan 2025', company: 'Infosys',            exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '21.20', epsActual: '--',    thisWeek: true  },
  { date: '15 Jan 2025', company: 'HDFC Bank',          exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '22.10', epsActual: '--',    thisWeek: true  },
  { date: '16 Jan 2025', company: 'Wipro',              exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '5.90',  epsActual: '--',    thisWeek: true  },
  { date: '17 Jan 2025', company: 'ICICI Bank',         exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '14.80', epsActual: '--',    thisWeek: true  },
  { date: '18 Jan 2025', company: 'Reliance Industries',exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '28.50', epsActual: '--',    thisWeek: true  },
  { date: '09 Jan 2025', company: 'TCS',                exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '30.40', epsActual: '29.84', thisWeek: false },
  { date: '22 Jan 2025', company: 'Axis Bank',          exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '18.30', epsActual: '--',    thisWeek: false },
  { date: '24 Jan 2025', company: 'ITC',                exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '5.10',  epsActual: '--',    thisWeek: false },
  { date: '28 Jan 2025', company: 'HUL',                exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '12.40', epsActual: '--',    thisWeek: false },
  { date: '29 Jan 2025', company: 'L&T',                exchange: 'NSE', eventType: 'Q3 FY25 Results', epsExpected: '38.20', epsActual: '--',    thisWeek: false },
  { date: '05 Dec 2024', company: 'Bajaj Finance',      exchange: 'NSE', eventType: 'Q2 FY25 Results', epsExpected: '90.10', epsActual: '91.20', thisWeek: false },
  { date: '28 Nov 2024', company: 'Maruti Suzuki',      exchange: 'NSE', eventType: 'Q2 FY25 Results', epsExpected: '145.0', epsActual: '144.6', thisWeek: false },
]

const HOLIDAYS: HolidayEvent[] = [
  { date: '26 Jan 2025', exchange: 'NSE / BSE', name: 'Republic Day',                        type: 'National' },
  { date: '26 Feb 2025', exchange: 'NSE / BSE', name: 'Mahashivratri',                       type: 'Religious' },
  { date: '31 Mar 2025', exchange: 'NSE / BSE', name: 'Id-Ul-Fitr (Ramzan Id)',              type: 'Religious' },
  { date: '10 Apr 2025', exchange: 'NSE / BSE', name: 'Shri Ram Navami',                     type: 'Religious' },
  { date: '14 Apr 2025', exchange: 'NSE / BSE', name: 'Dr. Baba Saheb Ambedkar Jayanti',     type: 'National' },
  { date: '18 Apr 2025', exchange: 'NSE / BSE', name: 'Good Friday',                         type: 'Religious' },
  { date: '01 May 2025', exchange: 'NSE / BSE', name: 'Maharashtra Day',                     type: 'State' },
  { date: '15 Aug 2025', exchange: 'NSE / BSE', name: 'Independence Day',                    type: 'National' },
  { date: '27 Aug 2025', exchange: 'NSE / BSE', name: 'Ganesh Chaturthi',                    type: 'Religious' },
  { date: '02 Oct 2025', exchange: 'NSE / BSE', name: 'Gandhi Jayanti / Dussehra',           type: 'National' },
  { date: '20 Oct 2025', exchange: 'NSE',       name: 'Diwali - Laxmi Puja (Muhurat Trading)',type: 'Religious' },
  { date: '21 Oct 2025', exchange: 'NSE / BSE', name: 'Diwali (Balipratipada)',              type: 'Religious' },
  { date: '05 Nov 2025', exchange: 'NSE / BSE', name: 'Prakash Gurpurb (Guru Nanak Jayanti)',type: 'Religious' },
  { date: '25 Dec 2025', exchange: 'NSE / BSE', name: 'Christmas',                           type: 'Religious' },
]

// ─── Shared Style Constants ───────────────────────────────────────────────────

const tableWrap: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  overflow: 'hidden',
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }

const thBase: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  whiteSpace: 'nowrap',
}

const tdBase: React.CSSProperties = {
  padding: '10px 14px',
  color: 'var(--text)',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
}

// ─── Impact Badge ─────────────────────────────────────────────────────────────

function ImpactBadge({ impact }: { impact: Impact }) {
  const colors: Record<Impact, string> = {
    High:   'var(--danger)',
    Medium: '#f59e0b',
    Low:    'var(--text-muted)',
  }
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        background: `${colors[impact]}22`,
        color: colors[impact],
        border: `1px solid ${colors[impact]}44`,
      }}
    >
      {impact}
    </span>
  )
}

// ─── Tab 1: Economic Calendar ─────────────────────────────────────────────────

const COUNTRIES = ['All', 'India', 'US', 'EU', 'UK', 'Japan']
const IMPACTS: ('All' | Impact)[] = ['All', 'High', 'Medium', 'Low']

function EconomicTab() {
  const [country, setCountry] = useState('All')
  const [impact, setImpact] = useState<'All' | Impact>('All')

  const filtered = useMemo(
    () =>
      ECON_EVENTS.filter(
        (e) =>
          (country === 'All' || e.country === country) &&
          (impact === 'All' || e.impact === impact),
      ),
    [country, impact],
  )

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text)',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value as 'All' | Impact)}
          style={selectStyle}
        >
          {IMPACTS.map((i) => <option key={i} value={i}>{i} Impact</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filtered.length} events
        </span>
      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Date', 'Country', 'Event', 'Impact', 'Expected', 'Actual', 'Previous'].map((h) => (
                <th key={h} style={thBase}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, idx) => (
              <tr
                key={idx}
                style={{
                  borderLeft: ev.upcoming ? '3px solid #3b82f6' : '3px solid transparent',
                  background: ev.upcoming ? '#3b82f608' : 'transparent',
                }}
              >
                <td style={{ ...tdBase, whiteSpace: 'nowrap', fontWeight: 500 }}>{ev.date}</td>
                <td style={tdBase}>{ev.country}</td>
                <td style={{ ...tdBase, maxWidth: 280 }}>{ev.event}</td>
                <td style={tdBase}><ImpactBadge impact={ev.impact} /></td>
                <td style={{ ...tdBase, color: 'var(--text-muted)' }}>{ev.expected}</td>
                <td
                  style={{
                    ...tdBase,
                    fontWeight: 600,
                    color: ev.actual === '--' ? 'var(--text-muted)' : 'var(--accent)',
                  }}
                >
                  {ev.actual}
                </td>
                <td style={{ ...tdBase, color: 'var(--text-muted)' }}>{ev.previous}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab 2: Stock Results Calendar ───────────────────────────────────────────

function ResultsTab() {
  return (
    <div style={tableWrap}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['Date', 'Company', 'Exchange', 'Event Type', 'EPS Expected', 'EPS Actual'].map((h) => (
              <th key={h} style={thBase}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESULTS_EVENTS.map((ev, idx) => (
            <tr
              key={idx}
              style={{
                borderLeft: ev.thisWeek ? '3px solid var(--accent)' : '3px solid transparent',
                background: ev.thisWeek ? 'var(--accent)08' : 'transparent',
              }}
            >
              <td style={{ ...tdBase, whiteSpace: 'nowrap', fontWeight: 500 }}>{ev.date}</td>
              <td style={{ ...tdBase, fontWeight: 600 }}>
                {ev.company}
                {ev.thisWeek && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'var(--accent)',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    This week
                  </span>
                )}
              </td>
              <td style={tdBase}>{ev.exchange}</td>
              <td style={{ ...tdBase, color: 'var(--text-muted)' }}>{ev.eventType}</td>
              <td style={{ ...tdBase, textAlign: 'right' }}>₹{ev.epsExpected}</td>
              <td
                style={{
                  ...tdBase,
                  textAlign: 'right',
                  fontWeight: 600,
                  color: ev.epsActual === '--' ? 'var(--text-muted)' : 'var(--success)',
                }}
              >
                {ev.epsActual === '--' ? '—' : `₹${ev.epsActual}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab 3: Holiday Calendar ──────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  National: '#3b82f6',
  Religious: '#a78bfa',
  State: '#f59e0b',
}

function HolidaysTab() {
  return (
    <div style={tableWrap}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {['Date', 'Exchange', 'Holiday Name', 'Type'].map((h) => (
              <th key={h} style={thBase}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOLIDAYS.map((h, idx) => (
            <tr key={idx}>
              <td style={{ ...tdBase, whiteSpace: 'nowrap', fontWeight: 500 }}>{h.date}</td>
              <td style={{ ...tdBase, color: 'var(--text-muted)', fontSize: 12 }}>{h.exchange}</td>
              <td style={{ ...tdBase, fontWeight: 500 }}>{h.name}</td>
              <td style={tdBase}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${TYPE_COLORS[h.type] ?? 'var(--text-muted)'}22`,
                    color: TYPE_COLORS[h.type] ?? 'var(--text-muted)',
                  }}
                >
                  {h.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'economic', label: 'Economic Calendar' },
  { key: 'results',  label: 'Stock Results Calendar' },
  { key: 'holidays', label: 'Holiday Calendar' },
]

export function CalendarPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('economic')

  return (
    <div style={{ padding: 24, color: 'var(--text)' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>Economic Calendar</h2>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'economic' && <EconomicTab />}
      {activeTab === 'results'  && <ResultsTab />}
      {activeTab === 'holidays' && <HolidaysTab />}
    </div>
  )
}
