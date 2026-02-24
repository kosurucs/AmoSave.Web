import * as signalR from '@microsoft/signalr';
import { getStoredAuthAccessKey } from '@/services/api/auth.service';

const HUB_URL = (import.meta.env.VITE_SIGNALR_URL as string | undefined) ?? 'http://localhost:5208/hubs/ticker';

export type TickUpdate = {
  symbol: string;
  lastPrice: number;
  change: number;
  changePct: number;
  volume: number;
  oi?: number;
  timestamp: string;
};

type TickCallback = (tick: TickUpdate) => void;

class TickerService {
  private connection: signalR.HubConnection | null = null;
  private subscribers = new Map<string, Set<TickCallback>>();
  private connecting = false;

  private buildConnection(): signalR.HubConnection {
    return new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getStoredAuthAccessKey() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  private async ensureConnected(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;
    if (this.connecting) return;

    this.connecting = true;
    try {
      this.connection = this.buildConnection();

      this.connection.on('TickUpdate', (tick: TickUpdate) => {
        const callbacks = this.subscribers.get(tick.symbol);
        if (callbacks) {
          callbacks.forEach((cb) => cb(tick));
        }
        // Also notify wildcard subscribers
        const wildcards = this.subscribers.get('*');
        if (wildcards) {
          wildcards.forEach((cb) => cb(tick));
        }
      });

      this.connection.onreconnected(() => {
        // Re-subscribe all symbols after reconnect
        this.subscribers.forEach((_, symbol) => {
          if (symbol !== '*') void this.sendSubscribe(symbol);
        });
      });

      await this.connection.start();
    } catch (err) {
      console.warn('[TickerService] Connection failed:', err);
    } finally {
      this.connecting = false;
    }
  }

  private async sendSubscribe(symbol: string): Promise<void> {
    try {
      await this.connection?.invoke('SubscribeTicker', symbol);
    } catch (err) {
      console.warn(`[TickerService] Subscribe failed for ${symbol}:`, err);
    }
  }

  private async sendUnsubscribe(symbol: string): Promise<void> {
    try {
      await this.connection?.invoke('UnsubscribeTicker', symbol);
    } catch (err) {
      console.warn(`[TickerService] Unsubscribe failed for ${symbol}:`, err);
    }
  }

  async subscribe(symbol: string, callback: TickCallback): Promise<void> {
    await this.ensureConnected();

    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      if (symbol !== '*') await this.sendSubscribe(symbol);
    }

    this.subscribers.get(symbol)!.add(callback);
  }

  async unsubscribe(symbol: string, callback: TickCallback): Promise<void> {
    const callbacks = this.subscribers.get(symbol);
    if (!callbacks) return;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.subscribers.delete(symbol);
      if (symbol !== '*') await this.sendUnsubscribe(symbol);
    }

    // Disconnect when no subscribers remain
    if (this.subscribers.size === 0) {
      await this.disconnect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
    this.subscribers.clear();
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton — shared across the app
export const tickerService = new TickerService();
