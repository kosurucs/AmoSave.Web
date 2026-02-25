import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

const EXCHANGES = ['ALL', 'NSE', 'BSE', 'NFO', 'MCX', 'CDS'];
const SEGMENTS = ['ALL', 'EQ', 'FUT', 'OPT', 'CE', 'PE', 'ETF', 'MF'];
const PAGE_SIZE = 50;

const thS: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-elevated)',
};
const tdS: React.CSSProperties = {
  padding: '9px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, verticalAlign: 'middle',
};

export function InstrumentsPage() {
  const query = useQuery({ queryKey: queryKeys.instruments, queryFn: marketService.getInstruments });
  const rows = (query.data ?? []) as Dictionary[];

  const [search, setSearch]       = useState('');
  const [exchange, setExchange]   = useState('ALL');
  const [segment, setSegment]     = useState('ALL');
  const [page, setPage]           = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const sym  = String(r.tradingsymbol ?? r.symbol ?? '').toLowerCase();
      const name = String(r.name ?? '').toLowerCase();
      const exch = String(r.exchange ?? '').toUpperCase();
      const inst = String(r.instrument_type ?? r.segment ?? '').toUpperCase();
      if (q && !sym.includes(q) && !name.includes(q)) return false;
      if (exchange !== 'ALL' && exch !== exchange) return false;
      if (segment !== 'ALL' && !inst.includes(segment)) return false;
      return true;
    });
  }, [rows, search, exchange, segment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(val: string) { setSearch(val); setPage(1); }
  function handleExchange(val: string) { setExchange(val); setPage(1); }
  function handleSegment(val: string) { setSegment(val); setPage(1); }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Search symbol or name…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 320, height: 36, fontSize: 13 }}
        />
        <select
          className="input"
          value={exchange}
          onChange={(e) => handleExchange(e.target.value)}
          style={{ height: 36, fontSize: 13 }}
        >
          {EXCHANGES.map((ex) => <option key={ex}>{ex}</option>)}
        </select>
        <select
          className="input"
          value={segment}
          onChange={(e) => handleSegment(e.target.value)}
          style={{ height: 36, fontSize: 13 }}
        >
          {SEGMENTS.map((sg) => <option key={sg}>{sg}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length.toLocaleString('en-IN')} instrument{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <AsyncState
        isLoading={query.isLoading}
        error={query.error ? mapHttpError(query.error) : null}
        isEmpty={rows.length === 0}
        emptyText="No instruments found"
      >
        <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thS}>Symbol</th>
                  <th style={thS}>Name</th>
                  <th style={thS}>Exchange</th>
                  <th style={thS}>Type</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Lot Size</th>
                  <th style={thS}>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                      No instruments match your filters
                    </td>
                  </tr>
                ) : paged.map((r, i) => {
                  const sym    = String(r.tradingsymbol ?? r.symbol ?? '—');
                  const name   = String(r.name ?? '—');
                  const exch   = String(r.exchange ?? '—');
                  const type   = String(r.instrument_type ?? r.segment ?? '—');
                  const lot    = Number(r.lot_size ?? r.lotSize ?? 0);
                  const expiry = r.expiry ? String(r.expiry) : '—';
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ ...tdS, fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{sym}</td>
                      <td style={{ ...tdS, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</td>
                      <td style={tdS}>
                        <span style={{ fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{exch}</span>
                      </td>
                      <td style={tdS}>
                        <span style={{ fontSize: 11, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{type}</span>
                      </td>
                      <td style={{ ...tdS, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {lot > 0 ? lot.toLocaleString('en-IN') : '—'}
                      </td>
                      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{expiry}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button
              className="btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 16px', fontSize: 12 }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {safePage} / {totalPages}
            </span>
            <button
              className="btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 16px', fontSize: 12 }}
            >
              Next →
            </button>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
