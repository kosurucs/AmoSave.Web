import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/api/market.service';
import { Badge } from '@/shared/components/badge';
import { mapHttpError } from '@/services/http/error-mapper';
import type { Dictionary } from '@/shared/types/api';

const fmt = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function QuoteCard({ symbol, data }: { symbol: string; data: Dictionary }) {
  const ltp = Number(data.lastPrice ?? data.last_price ?? 0);
  const change = Number(data.change ?? 0);
  const changePct = Number(data.changePercent ?? data.pChange ?? data.change_percent ?? 0);
  const isUp = change >= 0;
  const changeColor = isUp ? 'var(--success)' : 'var(--danger)';

  const ohlcData = (data.ohlc ?? data) as Dictionary;
  const open   = Number(ohlcData.open   ?? 0);
  const high   = Number(ohlcData.high   ?? 0);
  const low    = Number(ohlcData.low    ?? 0);
  const close  = Number(ohlcData.close  ?? 0);
  const volume = data.volume ?? data.tradedQuantity ?? data.traded_quantity;
  const oi     = data.openInterest ?? data.oi ?? data.open_interest;

  const [exchange, name] = symbol.includes(':') ? symbol.split(':', 2) : ['', symbol];

  const range = high > low ? ((ltp - low) / (high - low)) * 100 : 50;

  return (
    <div
      className="page-card"
      style={{ minWidth: 220, display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{name || symbol}</div>
          {exchange && <Badge>{exchange}</Badge>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>₹{fmt(ltp)}</div>
          <div style={{ color: changeColor, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
            {isUp ? '+' : ''}{fmt(change)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Day Range Bar */}
      {(high > 0 || low > 0) && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span style={{ color: 'var(--danger)' }}>L ₹{fmt(low)}</span>
            <span style={{ fontSize: 10 }}>Day Range</span>
            <span style={{ color: 'var(--success)' }}>H ₹{fmt(high)}</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, right: `${100 - range}%`, top: 0, bottom: 0,
              background: `linear-gradient(90deg, var(--danger), var(--success))`,
              borderRadius: 4,
            }} />
            <div style={{
              position: 'absolute', top: -2, bottom: -2, width: 6, background: 'var(--text)',
              borderRadius: 2, left: `calc(${range}% - 3px)`,
            }} />
          </div>
        </div>
      )}

      {/* OHLC Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px',
        fontSize: 12, color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)', paddingTop: 10,
      }}>
        <span>Open <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>₹{fmt(open)}</strong></span>
        <span>Close <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>₹{fmt(close)}</strong></span>
        {volume !== undefined && (
          <span>Vol <strong style={{ color: 'var(--text)' }}>{Number(volume).toLocaleString('en-IN')}</strong></span>
        )}
        {oi !== undefined && (
          <span>OI <strong style={{ color: 'var(--text)' }}>{Number(oi).toLocaleString('en-IN')}</strong></span>
        )}
      </div>
    </div>
  );
}

export function QuotesPage() {
  const [symbolsText, setSymbolsText] = useState('NSE:INFY,NSE:SBIN');
  const [fetchSymbols, setFetchSymbols] = useState<string[]>([]);

  const query = useQuery({
    queryKey: ['market', 'quotes-manual', ...fetchSymbols],
    queryFn: () => marketService.getQuotes(fetchSymbols),
    enabled: fetchSymbols.length > 0,
    refetchInterval: 15_000,
  });

  function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    const parsed = symbolsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setFetchSymbols(parsed);
  }

  const quoteMap = (query.data ?? {}) as Record<string, Dictionary>;
  const hasData = Object.keys(quoteMap).length > 0;

  return (
    <div>
      {/* Symbol Input */}
      <div className="page-card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>Market Quotes</h2>
        <form onSubmit={handleFetch} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)', flex: 1, minWidth: 240 }}>
            Symbols (comma-separated)
            <input
              className="input"
              value={symbolsText}
              onChange={(e) => setSymbolsText(e.target.value)}
              placeholder="NSE:RELIANCE,NSE:INFY,NFO:BANKNIFTY…"
              style={{ height: 38, fontSize: 13 }}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={query.isFetching}
            style={{ height: 38, minWidth: 130 }}
          >
            {query.isFetching ? 'Fetching…' : '↻ Fetch Quotes'}
          </button>
        </form>
        {query.isError && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, margin: '8px 0 0' }}>
            {mapHttpError(query.error)}
          </p>
        )}
        {hasData && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            Auto-refreshes every 15 s
          </div>
        )}
      </div>

      {hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {Object.entries(quoteMap).map(([sym, data]) => (
            <QuoteCard key={sym} symbol={sym} data={data} />
          ))}
        </div>
      )}

      {fetchSymbols.length > 0 && !hasData && !query.isFetching && !query.isError && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          No quote data returned for the requested symbols.
        </div>
      )}
    </div>
  );
}
