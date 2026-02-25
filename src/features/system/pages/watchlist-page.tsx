import { useEffect, useState } from 'react';
import { tickerService, type TickUpdate } from '@/services/signalr/ticker.service';
import { getKiteConnected } from '@/services/api/auth.service';

const WATCHLIST: { symbol: string; name: string; exchange: string }[] = [
  { symbol: 'NSE:NIFTY 50', name: 'NIFTY 50', exchange: 'NSE' },
  { symbol: 'NSE:NIFTY BANK', name: 'BANKNIFTY', exchange: 'NSE' },
  { symbol: 'NSE:RELIANCE', name: 'RELIANCE', exchange: 'NSE' },
  { symbol: 'NSE:TCS', name: 'TCS', exchange: 'NSE' },
  { symbol: 'NSE:INFY', name: 'INFY', exchange: 'NSE' },
  { symbol: 'NSE:HDFCBANK', name: 'HDFCBANK', exchange: 'NSE' },
  { symbol: 'NSE:ICICIBANK', name: 'ICICIBANK', exchange: 'NSE' },
  { symbol: 'NSE:SBIN', name: 'SBIN', exchange: 'NSE' },
  { symbol: 'NSE:BAJFINANCE', name: 'BAJFINANCE', exchange: 'NSE' },
  { symbol: 'NSE:WIPRO', name: 'WIPRO', exchange: 'NSE' },
];

type TickMap = Record<string, TickUpdate>;

export function WatchlistPage() {
  const kiteConnected = getKiteConnected();
  const [ticks, setTicks] = useState<TickMap>({});
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!kiteConnected) return;

    let active = true;

    const handleTick = (tick: TickUpdate) => {
      if (!active) return;
      setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
    };

    const subscribe = async () => {
      for (const item of WATCHLIST) {
        await tickerService.subscribe(item.symbol, handleTick);
      }
      if (active) setConnected(true);
    };

    void subscribe();

    return () => {
      active = false;
      for (const item of WATCHLIST) {
        void tickerService.unsubscribe(item.symbol, handleTick);
      }
      setConnected(false);
    };
  }, [kiteConnected]);

  const q = search.toLowerCase();
  const filtered = WATCHLIST.filter(
    (item) => item.name.toLowerCase().includes(q) || item.exchange.toLowerCase().includes(q),
  );

  return (
    <div className="page-card" style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Watchlist</h2>
        {kiteConnected && (
          <span style={{ fontSize: 12, color: connected ? '#35d18a' : 'var(--text-muted)' }}>
            {connected ? '● Live' : '○ Connecting…'}
          </span>
        )}
      </div>

      {/* Search bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="Search symbol…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {!kiteConnected && (
        <p style={{ margin: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          Connect your Kite account to see live prices.
        </p>
      )}

      {/* Column header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 90px 80px',
          padding: '6px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {(['Symbol', 'LTP', 'Change', 'Chg%'] as const).map((h) => (
          <span
            key={h}
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: h === 'Symbol' ? 'left' : 'right',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Watchlist rows */}
      {filtered.map((item) => {
        const tick = ticks[item.symbol];
        const isPositive = tick ? tick.change >= 0 : null;
        const changeColor =
          isPositive === null ? 'var(--text-muted)' : isPositive ? '#35d18a' : '#f06161';
        const sign = tick && tick.change >= 0 ? '+' : '';

        return (
          <div
            key={item.symbol}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 90px 80px',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(46,58,71,0.5)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(44,129,255,0.04)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = '';
            }}
          >
            {/* Symbol + exchange */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.exchange}</div>
            </div>

            {/* LTP */}
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {tick
                  ? tick.lastPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </span>
            </div>

            {/* Day change absolute */}
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: changeColor }}>
              <span style={{ fontSize: 13 }}>
                {tick ? `${sign}${tick.change.toFixed(2)}` : '—'}
              </span>
            </div>

            {/* Day change % */}
            <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: changeColor }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {tick ? `${sign}${tick.changePct.toFixed(2)}%` : '—'}
              </span>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 16px', fontSize: 13 }}>
          No symbols match your search
        </div>
      )}
    </div>
  );
}

