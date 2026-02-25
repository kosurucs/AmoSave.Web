import { useState } from 'react';

interface DraftLeg {
  side: 'BUY' | 'SELL';
  type: 'CE' | 'PE';
  strike: number;
  lots: number;
}

interface Draft {
  id: string;
  name: string;
  underlying: string;
  legs: DraftLeg[];
  createdAt: string;
  simulatedPnl: number;
}

const MOCK_DRAFTS: Draft[] = [
  {
    id: '1',
    name: 'Iron Condor NIFTY',
    underlying: 'NIFTY',
    legs: [
      { side: 'SELL', type: 'CE', strike: 22500, lots: 1 },
      { side: 'BUY', type: 'CE', strike: 22600, lots: 1 },
      { side: 'SELL', type: 'PE', strike: 22000, lots: 1 },
      { side: 'BUY', type: 'PE', strike: 21900, lots: 1 },
    ],
    createdAt: '2025-01-10',
    simulatedPnl: 4200,
  },
  {
    id: '2',
    name: 'Straddle BANKNIFTY',
    underlying: 'BANKNIFTY',
    legs: [
      { side: 'BUY', type: 'CE', strike: 48000, lots: 1 },
      { side: 'BUY', type: 'PE', strike: 48000, lots: 1 },
    ],
    createdAt: '2025-01-12',
    simulatedPnl: -1800,
  },
  {
    id: '3',
    name: 'Bull Call Spread FINNIFTY',
    underlying: 'FINNIFTY',
    legs: [
      { side: 'BUY', type: 'CE', strike: 19500, lots: 2 },
      { side: 'SELL', type: 'CE', strike: 20000, lots: 2 },
    ],
    createdAt: '2025-01-15',
    simulatedPnl: 3600,
  },
];

export function DraftPortfoliosPage() {
  const [drafts, setDrafts] = useState<Draft[]>(MOCK_DRAFTS);
  const [expanded, setExpanded] = useState<string | null>(null);

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Draft Portfolios
        </h2>
        <button className="btn btn-primary" style={{ fontSize: 13 }}>
          + New Draft
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="page-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
          No drafts saved. Create a new draft to get started.
        </div>
      ) : (
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Name', 'Underlying', 'Legs', 'Created', 'Simulated P&L', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <>
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: expanded === d.id ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  >
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text)' }}>
                      {d.name}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)' }}>{d.underlying}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text)' }}>{d.legs.length}</td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                      {new Date(d.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        fontWeight: 600,
                        color: d.simulatedPnl >= 0 ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {d.simulatedPnl >= 0 ? '+' : ''}₹{d.simulatedPnl.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn" style={{ fontSize: 11, padding: '3px 10px' }}>
                          Edit
                        </button>
                        <button
                          className="btn"
                          style={{ fontSize: 11, padding: '3px 10px', color: 'var(--danger)' }}
                          onClick={() => deleteDraft(d.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded === d.id && (
                    <tr key={`${d.id}-exp`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={6} style={{ padding: '0 16px 12px 32px' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                          Legs
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {d.legs.map((leg, i) => (
                            <span
                              key={i}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 6,
                                background: 'var(--bg-elevated)',
                                fontSize: 12,
                                color: leg.side === 'BUY' ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 600,
                              }}
                            >
                              {leg.side} {leg.strike} {leg.type} × {leg.lots}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
