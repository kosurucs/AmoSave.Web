import { useEffect, useState } from 'react';
import { tickerService, type TickUpdate } from '@/services/signalr/ticker.service';
import { getKiteConnected } from '@/services/api/auth.service';

const DEFAULT_SYMBOLS = ['NSE:NIFTY 50', 'NSE:NIFTY BANK', 'NSE:RELIANCE', 'NSE:INFY', 'NSE:TCS'];

type TickMap = Record<string, TickUpdate>;

export function WatchlistPage() {
  const kiteConnected = getKiteConnected();
  const [ticks, setTicks] = useState<TickMap>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!kiteConnected) return;

    let active = true;

    const handleTick = (tick: TickUpdate) => {
      if (!active) return;
      setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
    };

    const subscribe = async () => {
      // Subscribe to all default symbols
      for (const symbol of DEFAULT_SYMBOLS) {
        await tickerService.subscribe(symbol, handleTick);
      }
      if (active) setConnected(true);
    };

    void subscribe();

    return () => {
      active = false;
      // Unsubscribe on unmount
      for (const symbol of DEFAULT_SYMBOLS) {
        void tickerService.unsubscribe(symbol, handleTick);
      }
      setConnected(false);
    };
  }, [kiteConnected]);

  const formatChange = (change: number, pct: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
  };

  return (
    <section className="page-card">
      <h2 className="section-title">Watchlist</h2>

      {!kiteConnected && (
        <p className="helper" style={{ marginTop: 8 }}>
          Connect your Kite account using the <strong>Connect Kite</strong> button in the header to see live prices.
        </p>
      )}

      {kiteConnected && (
        <p className="helper" style={{ marginTop: 8 }}>
          {connected ? '● Live' : '○ Connecting…'}
        </p>
      )}

      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border, #333)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: 12, color: 'var(--color-muted, #888)' }}>Symbol</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: 12, color: 'var(--color-muted, #888)' }}>LTP</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: 12, color: 'var(--color-muted, #888)' }}>Change</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', fontSize: 12, color: 'var(--color-muted, #888)' }}>Volume</th>
          </tr>
        </thead>
        <tbody>
          {DEFAULT_SYMBOLS.map((symbol) => {
            const tick = ticks[symbol];
            const isPositive = tick ? tick.change >= 0 : null;
            return (
              <tr key={symbol} style={{ borderBottom: '1px solid var(--color-border, #222)' }}>
                <td style={{ padding: '8px', fontSize: 13 }}>{symbol.replace('NSE:', '')}</td>
                <td style={{ padding: '8px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {tick ? tick.lastPrice.toFixed(2) : '—'}
                </td>
                <td
                  style={{
                    padding: '8px',
                    fontSize: 13,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    color: isPositive === null ? 'inherit' : isPositive ? 'var(--color-success, #4caf50)' : 'var(--color-danger, #f44336)',
                  }}
                >
                  {tick ? formatChange(tick.change, tick.changePct) : '—'}
                </td>
                <td style={{ padding: '8px', fontSize: 13, textAlign: 'right', color: 'var(--color-muted, #888)' }}>
                  {tick ? tick.volume.toLocaleString('en-IN') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

