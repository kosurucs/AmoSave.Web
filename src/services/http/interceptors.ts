import { AxiosInstance } from 'axios';
import { getApiKey } from '@/services/http/axios-client';
import { AUTH_ACCESS_KEY_STORAGE_KEY, AUTH_USER_NAME_STORAGE_KEY, KITE_CONNECTED_STORAGE_KEY, KITE_USER_ID_STORAGE_KEY } from '@/services/api/auth.service';

function clearAuthAndRedirect() {
  try {
    window.localStorage.removeItem(AUTH_ACCESS_KEY_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_NAME_STORAGE_KEY);
    window.localStorage.removeItem(KITE_CONNECTED_STORAGE_KEY);
    window.localStorage.removeItem(KITE_USER_ID_STORAGE_KEY);
  } catch {
    // no-op
  }
  // Hard redirect so React router state is fully reset
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

export function applyInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    headers['x-correlation-id'] = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      try {
        const accessKey = window.localStorage.getItem('amo.authAccessKey');
        if (accessKey) {
          headers['X-Access-Key'] = accessKey;
          headers.Authorization = `Bearer ${accessKey}`; // kept for Kite JWT endpoints
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
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        clearAuthAndRedirect();
      }
      return Promise.reject(error);
    },
  );
}
