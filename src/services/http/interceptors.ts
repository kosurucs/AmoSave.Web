import { AxiosInstance } from 'axios';

export function applyInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const headers = config.headers ?? {};
    headers['x-correlation-id'] = crypto.randomUUID();
    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  );
}
