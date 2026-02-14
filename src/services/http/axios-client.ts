import axios from 'axios';
import { applyInterceptors } from '@/services/http/interceptors';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
});

applyInterceptors(apiClient);
