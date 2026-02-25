import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { getStoredAuthAccessKey, setStoredAuthAccessKey, setStoredAuthUserName, authService } from '@/services/api/auth.service';

const BOOTSTRAP_KEY = 'auto-bootstrap';

/**
 * Auto-logs in silently in the background. Always renders children immediately
 * so there is no loading flash or blink.
 */
export function AuthGuard() {
  useEffect(() => {
    const current = getStoredAuthAccessKey();
    if (current && current !== BOOTSTRAP_KEY) return; // real token already stored

    // Silently exchange bootstrap placeholder for real token
    authService
      .login({ username: 'Admin', password: 'Kosuru@1234' })
      .then((envelope) => {
        const token =
          (envelope.data?.accessToken as string | undefined) ??
          (envelope.data?.accessKey as string | undefined);
        if (token) {
          setStoredAuthUserName('Admin');
          setStoredAuthAccessKey(token);
        }
      })
      .catch(() => {
        // API unreachable — keep bootstrap key so interceptor doesn't hard-redirect
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always render children immediately — no loading state, no blink
  return <Outlet />;
}
