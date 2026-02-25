interface PnlCellProps {
  value: number;
  showPercent?: boolean;
  percentValue?: number;
}

export function PnlCell({ value, showPercent = false, percentValue }: PnlCellProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? '#35d18a' : isNegative ? '#f06161' : 'var(--text-muted)';
  const arrow = isPositive ? '▲' : isNegative ? '▼' : '—';

  const formatted = `₹${Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const sign = isNegative ? '-' : '';
  const percentStr =
    showPercent && percentValue !== undefined
      ? ` (${percentValue >= 0 ? '+' : ''}${percentValue.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}%)`
      : '';

  return (
    <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {arrow} {sign}{formatted}{percentStr}
    </span>
  );
}
