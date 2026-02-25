interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  color?: 'default' | 'green' | 'red';
}

const colorMap: Record<string, string> = {
  default: 'inherit',
  green: '#35d18a',
  red: 'var(--danger)',
};

export function StatCard({ title, value, sub, color = 'default' }: StatCardProps) {
  return (
    <div className="page-card">
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colorMap[color] }}>{value}</div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
