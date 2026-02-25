import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { dashboardService } from '@/services/api/dashboard.service';
import { queryKeys } from '@/shared/lib/query-keys';
import { StatCard } from '@/shared/components/stat-card';
import type { Dictionary } from '@/shared/types/api';

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

interface FeatureCard {
  emoji: string;
  title: string;
  description: string;
  to: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  { emoji: '⚡', title: 'Easy Options', description: 'Buy & sell options in one click with simple payoff view', to: '/app/trade/easy-options' },
  { emoji: '🧙', title: 'Strategy Wizard', description: 'Pick a market view and get ready-made strategies', to: '/app/trade/strategies' },
  { emoji: '🔧', title: 'Strategy Builder', description: 'Build, visualise & analyse custom multi-leg strategies', to: '/app/strategy-builder' },
  { emoji: '📋', title: 'Draft Portfolios', description: 'Save and manage option strategy drafts', to: '/app/trade/drafts' },
  { emoji: '🌡️', title: 'Options Heatmap', description: 'Spot high-OI strikes across the options chain at a glance', to: '/app/analyse/screener' },
  { emoji: '📤', title: 'Share P&L', description: 'Generate and share your positions P&L snapshot', to: '/app/portfolio/positions' },
];

interface AdvancedTool {
  emoji: string;
  label: string;
  to: string;
}

const ADVANCED_TOOLS: AdvancedTool[] = [
  { emoji: '📊', label: 'OI Chart', to: '/app/analyse/open-interest' },
  { emoji: '📈', label: 'IV Chart', to: '/app/analyse/iv-chart' },
  { emoji: '🏦', label: 'FII / DII', to: '/app/analyse/fii-dii' },
  { emoji: '🕯️', label: 'Candlestick', to: '/app/analyse/candlestick' },
  { emoji: '📅', label: 'Calendar', to: '/app/analyse/calendar' },
];

const cardBase: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '20px 22px',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'var(--text)',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  transition: 'border-color 0.18s, box-shadow 0.18s',
};

function FeatureCardItem({ card }: { card: FeatureCard }) {
  return (
    <NavLink
      to={card.to}
      style={({ isActive }) => ({
        ...cardBase,
        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
      })}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: 26 }}>{card.emoji}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{card.title}</span>
        <span style={{ color: 'var(--accent)', fontSize: 18, lineHeight: 1 }}>›</span>
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.4 }}>{card.description}</div>
    </NavLink>
  );
}

function AdvancedToolItem({ tool }: { tool: AdvancedTool }) {
  return (
    <NavLink
      to={tool.to}
      style={({ isActive }) => ({
        background: isActive ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 18px',
        textDecoration: 'none',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        minWidth: 90,
        flex: 1,
        transition: 'border-color 0.18s',
      })}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <span style={{ fontSize: 22 }}>{tool.emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{tool.label}</span>
    </NavLink>
  );
}

export function DashboardPage() {
  const query = useQuery({ queryKey: queryKeys.dashboardSummary, queryFn: dashboardService.getDashboardSummary });
  const data = query.data as Dictionary | undefined;

  const dayPnl   = Number(data?.dayPnl   ?? data?.todayPnl   ?? 0);
  const netPnl   = Number(data?.netPnl   ?? data?.totalPnl   ?? 0);
  const margin   = Number(data?.marginUsed ?? data?.usedMargin ?? 0);
  const openOrders = Number(data?.openOrders ?? data?.pendingOrders ?? 0);

  const pnlColor = (v: number) => (v > 0 ? 'green' : v < 0 ? 'red' : 'default') as 'green' | 'red' | 'default';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{greeting()} 👋</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{todayLabel()}</div>
        </div>
        <NavLink
          to="/app/trade/easy-options"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Option Chain →
        </NavLink>
      </div>

      {/* Feature cards 2×3 grid */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Quick Access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {FEATURE_CARDS.map(card => <FeatureCardItem key={card.to} card={card} />)}
        </div>
      </section>

      {/* Portfolio Summary */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Portfolio Summary
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard
            title="Day P&L"
            value={query.isLoading ? '—' : fmt(dayPnl)}
            color={pnlColor(dayPnl)}
            sub={query.isLoading ? 'Loading…' : undefined}
          />
          <StatCard
            title="Net P&L"
            value={query.isLoading ? '—' : fmt(netPnl)}
            color={pnlColor(netPnl)}
            sub={query.isLoading ? 'Loading…' : undefined}
          />
          <StatCard
            title="Margin Used"
            value={query.isLoading ? '—' : fmt(margin)}
            sub={query.isLoading ? 'Loading…' : undefined}
          />
          <StatCard
            title="Open Orders"
            value={query.isLoading ? '—' : openOrders}
            sub={query.isLoading ? 'Loading…' : undefined}
          />
        </div>
      </section>

      {/* Advanced Tools */}
      <section>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Advanced Tools
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ADVANCED_TOOLS.map(tool => <AdvancedToolItem key={tool.to} tool={tool} />)}
        </div>
      </section>

    </div>
  );
}
