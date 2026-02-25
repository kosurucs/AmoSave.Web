import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { optionsService } from '@/services/api/options.service';
import { AsyncState } from '@/shared/components/async-state';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

const UNDERLYINGS = ['BANKNIFTY', 'NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'] as const;
type Underlying = (typeof UNDERLYINGS)[number];

function num(v: unknown, decimals = 2): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return isNaN(n) ? '—' : n.toFixed(decimals);
}

export function ExpiryTradesPage() {
  const [underlying, setUnderlying] = useState<Underlying>('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('');

  const expiryQuery = useQuery({
    queryKey: ['expiry', 'list', underlying],
    queryFn: () => optionsService.getExpiries(underlying),
  });

  const expiries: string[] = (expiryQuery.data ?? []).slice(0, 4);

  const activeExpiry = selectedExpiry || expiries[0] || '';

  const chainQuery = useQuery({
    queryKey: ['expiry', 'chain', underlying, activeExpiry],
    queryFn: () =>
      optionsService.getOptionChain({ userId: '', underlying, expiry: activeExpiry }),
    enabled: !!activeExpiry,
  });

  const chain = chainQuery.data as Dictionary | undefined;
  const strikes: Dictionary[] = Array.isArray(chain?.strikes)
    ? (chain!.strikes as Dictionary[])
    : [];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
        Expiry Trades
      </h2>

      {/* Underlying selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {UNDERLYINGS.map((u) => (
          <button
            key={u}
            className="btn"
            style={{
              fontSize: 12,
              padding: '4px 14px',
              background: underlying === u ? 'var(--accent)' : 'var(--bg-elevated)',
              color: underlying === u ? '#fff' : 'var(--text)',
              border: 'none',
            }}
            onClick={() => {
              setUnderlying(u);
              setSelectedExpiry('');
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Expiry pills */}
      <AsyncState
        isLoading={expiryQuery.isLoading}
        error={expiryQuery.error ? mapHttpError(expiryQuery.error) : null}
        isEmpty={expiries.length === 0}
        emptyText="No expiry dates available."
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {expiries.map((exp) => (
            <button
              key={exp}
              className="btn"
              style={{
                fontSize: 12,
                padding: '4px 14px',
                background: activeExpiry === exp ? 'var(--accent-2)' : 'var(--bg-card)',
                color: activeExpiry === exp ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 999,
              }}
              onClick={() => setSelectedExpiry(exp)}
            >
              {exp}
            </button>
          ))}
        </div>

        {activeExpiry && (
          <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
            <AsyncState
              isLoading={chainQuery.isLoading}
              error={chainQuery.error ? mapHttpError(chainQuery.error) : null}
              isEmpty={strikes.length === 0}
              emptyText="No options data for this expiry."
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {[
                      'Strike',
                      'CE LTP',
                      'CE IV',
                      'CE Delta',
                      'CE Theta',
                      'PE LTP',
                      'PE IV',
                      'PE Delta',
                      'PE Theta',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '9px 12px',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          fontSize: 11,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strikes.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td
                        style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: 'var(--text)',
                        }}
                      >
                        {String(row.strikePrice ?? row.strike ?? '—')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--success)' }}>
                        {num(row.ceLtp ?? row.ce_ltp)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)' }}>
                        {num(row.ceIv ?? row.ce_iv)}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)' }}>
                        {num(row.ceDelta ?? row.ce_delta)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--danger)' }}>
                        {num(row.ceTheta ?? row.ce_theta)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--danger)' }}>
                        {num(row.peLtp ?? row.pe_ltp)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)' }}>
                        {num(row.peIv ?? row.pe_iv)}%
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text)' }}>
                        {num(row.peDelta ?? row.pe_delta)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--danger)' }}>
                        {num(row.peTheta ?? row.pe_theta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AsyncState>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
