import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { mapHttpError } from '@/services/http/error-mapper';

type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';
type CardType = 'call' | 'put' | 'straddle';

interface CardState {
  stock: string;
  expiry: string;
  strike: string;
  lots: string;
}

const SENTIMENT_OPTIONS: Sentiment[] = ['Bullish', 'Bearish', 'Neutral'];
const SENTIMENT_COLOR: Record<Sentiment, string> = {
  Bullish: 'var(--success)',
  Bearish: 'var(--danger)',
  Neutral: 'var(--accent)',
};

const CARD_CONFIGS: { type: CardType; label: string; emoji: string; color: string }[] = [
  { type: 'call', label: 'Buy Call', emoji: '📈', color: 'var(--success)' },
  { type: 'put', label: 'Buy Put', emoji: '📉', color: 'var(--danger)' },
  { type: 'straddle', label: 'Both (Straddle)', emoji: '⚡', color: 'var(--accent-2)' },
];

const EMPTY_CARD: CardState = { stock: '', expiry: '', strike: '', lots: '1' };

export function EasyOptionsPage() {
  const [sentiment, setSentiment] = useState<Sentiment>('Bullish');
  const [cards, setCards] = useState<Record<CardType, CardState>>({
    call: { ...EMPTY_CARD },
    put: { ...EMPTY_CARD },
    straddle: { ...EMPTY_CARD },
  });
  const [success, setSuccess] = useState<CardType | null>(null);
  const [errors, setErrors] = useState<Record<CardType, string>>({ call: '', put: '', straddle: '' });

  const orderMutation = useMutation({
    mutationFn: ordersService.placeOrder,
    onSuccess: (_, vars) => {
      setSuccess(vars._cardType as CardType);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err, vars) => {
      setErrors((prev) => ({
        ...prev,
        [(vars as { _cardType: CardType })._cardType]: mapHttpError(err),
      }));
    },
  });

  function setCard(type: CardType, field: keyof CardState, value: string) {
    setCards((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
    setErrors((prev) => ({ ...prev, [type]: '' }));
  }

  function handleBuy(type: CardType) {
    const c = cards[type];
    if (!c.stock || !c.expiry || !c.strike) {
      setErrors((prev) => ({ ...prev, [type]: 'Fill in stock, expiry, and strike.' }));
      return;
    }
    const legs =
      type === 'straddle'
        ? [
            { tradingsymbol: `${c.stock}${c.expiry}${c.strike}CE`, transactionType: 'BUY', lots: Number(c.lots) },
            { tradingsymbol: `${c.stock}${c.expiry}${c.strike}PE`, transactionType: 'BUY', lots: Number(c.lots) },
          ]
        : [
            {
              tradingsymbol: `${c.stock}${c.expiry}${c.strike}${type === 'call' ? 'CE' : 'PE'}`,
              transactionType: 'BUY',
              lots: Number(c.lots),
            },
          ];
    orderMutation.mutate({ legs, _cardType: type });
  }

  const estPnl = (c: CardState) => {
    const lots = parseInt(c.lots) || 0;
    const strike = parseFloat(c.strike) || 0;
    return lots && strike ? `₹${(lots * strike * 50).toLocaleString('en-IN')}` : '—';
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Easy Options
        </h2>
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-elevated)', borderRadius: 8, padding: 4 }}>
          {SENTIMENT_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSentiment(s)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: sentiment === s ? SENTIMENT_COLOR[s] : 'transparent',
                color: sentiment === s ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {CARD_CONFIGS.map(({ type, label, emoji, color }) => {
          const c = cards[type];
          const isLoading = orderMutation.isPending && (orderMutation.variables as { _cardType: CardType })?._cardType === type;
          return (
            <div
              key={type}
              className="page-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                borderTop: `3px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Market order · NFO</div>
                </div>
              </div>

              {(['stock', 'expiry', 'strike', 'lots'] as (keyof CardState)[]).map((field) => (
                <label
                  key={field}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}
                >
                  {field === 'stock' ? 'Symbol' : field.charAt(0).toUpperCase() + field.slice(1)}
                  <input
                    className="input"
                    type={field === 'lots' ? 'number' : 'text'}
                    min={field === 'lots' ? 1 : undefined}
                    placeholder={
                      field === 'stock' ? 'NIFTY' : field === 'expiry' ? '24JAN25' : field === 'strike' ? '22000' : '1'
                    }
                    value={c[field]}
                    onChange={(e) => setCard(type, field, e.target.value)}
                    style={{ fontSize: 13 }}
                  />
                </label>
              ))}

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Estimated Max Profit: </span>
                <strong style={{ color }}>{estPnl(c)}</strong>
              </div>

              {errors[type] && (
                <p className="error-text" style={{ margin: 0 }}>
                  {errors[type]}
                </p>
              )}
              {success === type && (
                <p style={{ margin: 0, color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                  ✓ Order placed successfully!
                </p>
              )}

              <button
                className="btn btn-primary"
                style={{ background: color, border: 'none', fontWeight: 700, fontSize: 14 }}
                disabled={isLoading}
                onClick={() => handleBuy(type)}
              >
                {isLoading ? 'Placing…' : 'Buy Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
