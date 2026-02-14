import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="login-layout">
      <section className="login-panel">
        <h1>Welcome to AmoSave</h1>
        <p>
          India-focused trading UI experience with a clean dark dashboard design. Connect your broker and
          continue with data-driven workflows.
        </p>
        <div className="login-bullet">No extra platform fee for API-driven execution workflows.</div>
        <div className="login-bullet">SEBI compliance and risk-aware UX patterns.</div>
        <div className="login-bullet">Built for consistent trading operations and visibility.</div>
      </section>
      <aside className="login-card">
        <h2 className="section-title">Login to continue</h2>
        <button className="btn btn-primary">Login with Zerodha</button>
        <button className="btn">Login with Angel One</button>
        <button className="btn">Login with Upstox</button>
        <button className="btn">Login with ICICI Direct</button>
        <button className="btn">Sign in with Google</button>
        <p className="helper" style={{ marginTop: 16 }}>
          By proceeding, you agree to terms and conditions.
        </p>
        <Link className="btn" to="/app/watchlist" style={{ display: 'grid', placeItems: 'center' }}>
          Continue to App Shell
        </Link>
      </aside>
    </div>
  );
}
