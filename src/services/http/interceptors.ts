import { AxiosInstance } from 'axios';
import { getApiKey } from '@/services/http/axios-client';
import { AUTH_ACCESS_KEY_STORAGE_KEY, AUTH_USER_NAME_STORAGE_KEY, KITE_CONNECTED_STORAGE_KEY, KITE_USER_ID_STORAGE_KEY } from '@/services/api/auth.service';

const BOOTSTRAP_KEY = 'auto-bootstrap';

function clearAuthAndRedirect() {
  // Don't redirect if we're still in the bootstrap phase
  const current = (() => {
    try { return window.localStorage.getItem(AUTH_ACCESS_KEY_STORAGE_KEY); } catch { return null; }
  })();
  if (current === BOOTSTRAP_KEY) return;

  try {
    window.localStorage.removeItem(AUTH_ACCESS_KEY_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_NAME_STORAGE_KEY);
    window.localStorage.removeItem(KITE_CONNECTED_STORAGE_KEY);
    window.localStorage.removeItem(KITE_USER_ID_STORAGE_KEY);
  } catch {
    // no-op
  }
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export function applyInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    headers['x-correlation-id'] = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      try {
        const accessKey = window.localStorage.getItem('amo.authAccessKey');
        // Never send the bootstrap placeholder — it will cause a 401
        if (accessKey && accessKey !== BOOTSTRAP_KEY) {
          headers['X-Access-Key'] = accessKey;
          headers.Authorization = `Bearer ${accessKey}`;
        }

        const apiKey = getApiKey().trim();
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }
      } catch {
        // no-op
      }
    }
    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      // Do NOT do a global redirect on 401 — Kite-dependent endpoints return 401
      // when Kite isn't connected, which is a normal state. Individual pages
      // handle their own errors. Only hard-redirect on explicit session expiry
      // which is indicated by a 401 with code "SESSION_EXPIRED".
      const status = (error as { response?: { status?: number } })?.response?.status;
      const code = (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (status === 401 && code === 'SESSION_EXPIRED') {
        clearAuthAndRedirect();
      }
      return Promise.reject(error);
    },
  );
}
