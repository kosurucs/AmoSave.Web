import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersService } from '@/services/api/orders.service';
import { mapHttpError } from '@/services/http/error-mapper';

type TransactionType = 'BUY' | 'SELL';
type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';

interface FormState {
  exchange: string;
  tradingsymbol: string;
  transactionType: TransactionType;
  product: string;
  orderType: OrderType;
  quantity: string;
  price: string;
  triggerPrice: string;
}

export function PlaceOrderPage() {
  const [form, setForm] = useState<FormState>({
    exchange: 'NSE',
    tradingsymbol: '',
    transactionType: 'BUY',
    product: 'MIS',
    orderType: 'MARKET',
    quantity: '1',
    price: '0',
    triggerPrice: '0',
  });

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => ordersService.placeOrder(body),
  });

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showPrice = form.orderType !== 'MARKET';
  const showTrigger = form.orderType === 'SL' || form.orderType === 'SL-M';

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      exchange: form.exchange,
      tradingsymbol: form.tradingsymbol,
      transactionType: form.transactionType,
      product: form.product,
      orderType: form.orderType,
      quantity: Number(form.quantity),
      price: showPrice ? Number(form.price) : 0,
      triggerPrice: showTrigger ? Number(form.triggerPrice) : 0,
      validity: 'DAY',
    });
  };

  const isBuy = form.transactionType === 'BUY';
  const orderId = mutation.data ? String(mutation.data['orderId'] ?? '') : '';

  return (
    <div className="data-grid">
      <section className="page-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Place Order</h2>
        <form className="form-grid" onSubmit={onSubmit}>
          {/* Exchange */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Exchange</label>
            <select className="select" value={form.exchange} onChange={(e) => set('exchange', e.target.value)}>
              <option>NSE</option>
              <option>BSE</option>
              <option>NFO</option>
              <option>MCX</option>
            </select>
          </div>

          {/* Trading Symbol */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Trading Symbol</label>
            <input
              className="input"
              placeholder="e.g. RELIANCE"
              value={form.tradingsymbol}
              onChange={(e) => set('tradingsymbol', e.target.value)}
              required
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Transaction Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['BUY', 'SELL'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('transactionType', t)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: '2px solid',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderColor: form.transactionType === t
                      ? t === 'BUY' ? '#35d18a' : '#f06161'
                      : 'var(--border)',
                    background: form.transactionType === t
                      ? t === 'BUY' ? 'rgba(53,209,138,0.15)' : 'rgba(240,97,97,0.15)'
                      : 'var(--bg-elevated)',
                    color: form.transactionType === t
                      ? t === 'BUY' ? '#35d18a' : '#f06161'
                      : 'var(--text-muted)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Product</label>
            <select className="select" value={form.product} onChange={(e) => set('product', e.target.value)}>
              <option>MIS</option>
              <option>CNC</option>
              <option>NRML</option>
            </select>
          </div>

          {/* Order Type */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Order Type</label>
            <select className="select" value={form.orderType} onChange={(e) => set('orderType', e.target.value as OrderType)}>
              <option>MARKET</option>
              <option>LIMIT</option>
              <option>SL</option>
              <option>SL-M</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Quantity</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              required
            />
          </div>

          {/* Price (hidden for MARKET) */}
          {showPrice && (
            <div>
              <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Price</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.05"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
              />
            </div>
          )}

          {/* Trigger Price (SL / SL-M only) */}
          {showTrigger && (
            <div>
              <label className="helper" style={{ display: 'block', marginBottom: 4 }}>Trigger Price</label>
              <input
                className="input"
                type="number"
                min={0}
                step="0.05"
                value={form.triggerPrice}
                onChange={(e) => set('triggerPrice', e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            className="btn"
            type="submit"
            disabled={mutation.isPending}
            style={{
              background: isBuy ? 'var(--accent)' : 'var(--danger)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {mutation.isPending ? 'Placing…' : `Place ${form.transactionType} Order`}
          </button>

          {mutation.error && (
            <div className="error-text">{mapHttpError(mutation.error)}</div>
          )}

          {mutation.isSuccess && (
            <div style={{
              background: 'rgba(53,209,138,0.12)',
              border: '1px solid #35d18a',
              borderRadius: 6,
              padding: '12px 16px',
              color: '#35d18a',
            }}>
              Order placed successfully{orderId ? ` — Order ID: ${orderId}` : ''}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
