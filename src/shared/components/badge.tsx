import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'buy' | 'sell' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { background: string; color: string }> = {
  default: { background: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  buy: { background: 'rgba(53,209,138,0.15)', color: '#35d18a' },
  sell: { background: 'rgba(240,97,97,0.15)', color: '#f06161' },
  success: { background: 'rgba(53,209,138,0.15)', color: '#35d18a' },
  danger: { background: 'rgba(240,97,97,0.15)', color: '#f06161' },
  warning: { background: 'rgba(244,201,74,0.15)', color: '#f4c94a' },
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      style={{
        borderRadius: 999,
        fontSize: 11,
        padding: '2px 8px',
        display: 'inline-block',
        ...styles,
      }}
    >
      {children}
    </span>
  );
}
