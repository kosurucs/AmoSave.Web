import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setStoredAuthAccessKey, setStoredAuthUserName } from '@/services/api/auth.service';
import { mapHttpError } from '@/services/http/error-mapper';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('Kosuru@1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const envelope = await authService.login({ username: username.trim(), password });
      if (!envelope.success) {
        setLoginError(envelope.error?.message ?? 'Login failed.');
        return;
      }

      const responseUserName = envelope.data?.username;
      const storedUserName = typeof responseUserName === 'string' && responseUserName.trim()
        ? responseUserName.trim()
        : username.trim();
      setStoredAuthUserName(storedUserName);

      // API returns `accessKey` (not `accessToken`) — check both for safety
      const responseAccessToken = envelope.data?.accessKey ?? envelope.data?.accessToken;
      const storedAccessKey = typeof responseAccessToken === 'string' && responseAccessToken.trim()
        ? responseAccessToken.trim()
        : null;

      if (!storedAccessKey) {
        setLoginError('Login succeeded but no access token was returned. Please try again.');
        return;
      }

      setStoredAuthAccessKey(storedAccessKey);
      navigate('/app/dashboard');
    } catch (error) {
      setLoginError(mapHttpError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <form className="form-grid" onSubmit={handleLogin}>
          <label className="helper" htmlFor="username" style={{ marginTop: 8 }}>
            Username
          </label>
          <input
            id="username"
            className="input"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
          />
          <label className="helper" htmlFor="password" style={{ marginTop: 8 }}>
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {loginError ? <p className="error-text">{loginError}</p> : null}
        </form>
        <button
          className="btn"
          type="button"
          style={{ marginTop: 8 }}
          onClick={() => {
            setStoredAuthUserName('Guest');
            setStoredAuthAccessKey('guest-demo-mode');
            navigate('/app/dashboard');
          }}
        >
          Continue as Guest (Demo)
        </button>
      </aside>
    </div>
  );
}
