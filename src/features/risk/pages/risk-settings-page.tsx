import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskService } from '@/services/api/risk.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { AsyncState } from '@/shared/components/async-state';
import { mapHttpError } from '@/services/http/error-mapper';

type FormState = {
  maxDailyLoss: string;
  maxOpenPositions: string;
  maxMarginUsagePct: string;
  autoSquareOffTime: string;
  stopLossPct: string;
};

export function RiskSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    maxDailyLoss: '',
    maxOpenPositions: '',
    maxMarginUsagePct: '',
    autoSquareOffTime: '15:20',
    stopLossPct: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [haltError, setHaltError] = useState('');
  const [haltSuccess, setHaltSuccess] = useState(false);

  const query = useQuery({ queryKey: queryKeys.riskSettings, queryFn: riskService.getRiskSettings });

  useEffect(() => {
    if (query.data) {
      const d = query.data;
      setForm({
        maxDailyLoss: String(d.maxDailyLoss ?? d.maxPositionSize ?? ''),
        maxOpenPositions: String(d.maxOpenPositions ?? ''),
        maxMarginUsagePct: String(d.maxMarginUsagePct ?? d.maxCapitalPerTradePct ?? ''),
        autoSquareOffTime: String(d.autoSquareOffTime ?? '15:20'),
        stopLossPct: String(d.stopLossPct ?? ''),
      });
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: riskService.updateRiskSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.riskSettings });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const haltMutation = useMutation({
    mutationFn: riskService.haltTrading,
    onSuccess: () => {
      setHaltSuccess(true);
      setHaltError('');
    },
    onError: (err) => setHaltError(mapHttpError(err)),
  });

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({
      maxDailyLoss: Number(form.maxDailyLoss),
      maxOpenPositions: Number(form.maxOpenPositions),
      maxMarginUsagePct: Number(form.maxMarginUsagePct),
      autoSquareOffTime: form.autoSquareOffTime,
      stopLossPct: Number(form.stopLossPct),
    });
  }

  function handleHalt() {
    if (!window.confirm('Halt all trading? This will cancel active strategies.')) return;
    setHaltSuccess(false);
    haltMutation.mutate(undefined);
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type: string;
    placeholder: string;
    min?: string;
    max?: string;
    step?: string;
  }[] = [
    { key: 'maxDailyLoss', label: 'Max Loss Per Day (\u20b9)', type: 'number', placeholder: '5000', min: '0' },
    { key: 'maxOpenPositions', label: 'Max Positions', type: 'number', placeholder: '5', min: '1' },
    { key: 'maxMarginUsagePct', label: 'Max Margin Usage (%)', type: 'number', placeholder: '80', min: '0', max: '100' },
    { key: 'autoSquareOffTime', label: 'Auto Square-off Time', type: 'time', placeholder: '15:20' },
    { key: 'stopLossPct', label: 'Stop-loss %', type: 'number', placeholder: '2', min: '0', max: '100', step: '0.1' },
  ];

  return (
    <AsyncState
      isLoading={query.isLoading}
      error={query.error ? mapHttpError(query.error) : null}
      isEmpty={false}
      emptyText=""
    >
      <section className="page-card" style={{ maxWidth: 560 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>Risk Settings</h2>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {fields.map(({ key, label, type, placeholder, min, max, step }) => (
              <label
                key={key}
                style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}
              >
                {label}
                <input
                  className="input"
                  type={type}
                  min={min}
                  max={max}
                  step={step}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                />
              </label>
            ))}
          </div>

          {saveMutation.isError && (
            <p className="error-text" style={{ marginTop: 12 }}>{mapHttpError(saveMutation.error)}</p>
          )}
          {saveSuccess && (
            <p style={{ marginTop: 12, color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
              Settings saved successfully.
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              className="btn"
              type="button"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={handleHalt}
              disabled={haltMutation.isPending}
            >
              {haltMutation.isPending ? 'Halting...' : 'Halt All Trading'}
            </button>
          </div>
        </form>

        {haltError && <p className="error-text" style={{ marginTop: 8 }}>{haltError}</p>}
        {haltSuccess && (
          <p style={{ marginTop: 8, color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>
            Trading halted.
          </p>
        )}
      </section>
    </AsyncState>
  );
}
