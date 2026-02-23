import { AxiosInstance } from 'axios';
import { getApiKey } from '@/services/http/axios-client';

export function applyInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    headers['x-correlation-id'] = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      try {
        const accessKey = window.localStorage.getItem('amo.authAccessKey');
        if (accessKey) {
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
    (error) => Promise.reject(error),
  );
}
