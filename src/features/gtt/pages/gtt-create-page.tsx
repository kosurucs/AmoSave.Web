import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { gttService } from '@/services/api/gtt.service';
import { mapHttpError } from '@/services/http/error-mapper';

type TriggerType = 'single' | 'two-leg';
type TxnType = 'BUY' | 'SELL';

const labelS: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)',
};
const inputS: React.CSSProperties = { height: 38, fontSize: 14 };

export function GttCreatePage() {
  const navigate = useNavigate();
  const [exchange, setExchange] = useState('NSE');
  const [symbol, setSymbol] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('single');
  const [lastPrice, setLastPrice] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [txnType, setTxnType] = useState<TxnType>('BUY');
  // OCO second leg
  const [triggerPrice2, setTriggerPrice2] = useState('');
  const [limitPrice2, setLimitPrice2] = useState('');
  const [txnType2, setTxnType2] = useState<TxnType>('SELL');

  const mutation = useMutation({
    mutationFn: gttService.createTrigger,
    onSuccess: () => navigate('/app/gtt'),
  });

  function buildPayload() {
    const baseCondition = {
      exchange,
      tradingsymbol: symbol.trim().toUpperCase(),
      last_price: Number(lastPrice),
      trigger_values: triggerType === 'single'
        ? [Number(triggerPrice)]
        : [Number(triggerPrice), Number(triggerPrice2)],
    };
    const baseOrder = {
      exchange,
      tradingsymbol: symbol.trim().toUpperCase(),
      transaction_type: txnType,
      quantity: Number(qty),
      order_type: 'LIMIT',
      product: 'CNC',
      price: Number(limitPrice),
    };
    const orders = triggerType === 'single'
      ? [baseOrder]
      : [
          baseOrder,
          { ...baseOrder, transaction_type: txnType2, price: Number(limitPrice2) },
        ];
    return { type: triggerType, condition: baseCondition, orders };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(buildPayload());
  }

  const isOco = triggerType === 'two-leg';

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create GTT Order</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Set a trigger that auto-places your order when price conditions are met
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="page-card" style={{ display: 'grid', gap: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instrument
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16 }}>
            <label style={labelS}>
              Exchange
              <select className="input" style={inputS} value={exchange} onChange={(e) => setExchange(e.target.value)}>
                <option>NSE</option>
                <option>BSE</option>
                <option>NFO</option>
                <option>MCX</option>
              </select>
            </label>
            <label style={labelS}>
              Symbol
              <input
                className="input" style={inputS} required placeholder="INFY" value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={labelS}>
              Trigger Type
              <select className="input" style={inputS} value={triggerType} onChange={(e) => setTriggerType(e.target.value as TriggerType)}>
                <option value="single">Single</option>
                <option value="two-leg">OCO (Two-leg)</option>
              </select>
            </label>
            <label style={labelS}>
              Last Price (LTP)
              <input
                className="input" style={inputS} type="number" step="0.05" required placeholder="0.00"
                value={lastPrice} onChange={(e) => setLastPrice(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Leg 1 */}
        <div className="page-card" style={{ display: 'grid', gap: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isOco ? 'Leg 1 — Target / Stop-Loss' : 'Trigger Conditions'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            <label style={labelS}>
              Transaction Type
              <select className="input" style={inputS} value={txnType} onChange={(e) => setTxnType(e.target.value as TxnType)}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </label>
            <label style={labelS}>
              Trigger Price
              <input
                className="input" style={inputS} type="number" step="0.05" required placeholder="0.00"
                value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)}
              />
            </label>
            <label style={labelS}>
              Limit Price
              <input
                className="input" style={inputS} type="number" step="0.05" required placeholder="0.00"
                value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)}
              />
            </label>
            <label style={labelS}>
              Quantity
              <input
                className="input" style={inputS} type="number" min="1" required placeholder="1"
                value={qty} onChange={(e) => setQty(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Leg 2 (OCO) */}
        {isOco && (
          <div className="page-card" style={{ display: 'grid', gap: 20, marginBottom: 16, borderLeft: '3px solid var(--accent-2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Leg 2 — Counter Order
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              <label style={labelS}>
                Transaction Type
                <select className="input" style={inputS} value={txnType2} onChange={(e) => setTxnType2(e.target.value as TxnType)}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </label>
              <label style={labelS}>
                Trigger Price
                <input
                  className="input" style={inputS} type="number" step="0.05" required placeholder="0.00"
                  value={triggerPrice2} onChange={(e) => setTriggerPrice2(e.target.value)}
                />
              </label>
              <label style={labelS}>
                Limit Price
                <input
                  className="input" style={inputS} type="number" step="0.05" required placeholder="0.00"
                  value={limitPrice2} onChange={(e) => setLimitPrice2(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        {mutation.isError && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
            {mapHttpError(mutation.error)}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={mutation.isPending}
            style={{ minWidth: 160 }}
          >
            {mutation.isPending ? 'Creating…' : 'Create GTT Order'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/app/gtt')}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}