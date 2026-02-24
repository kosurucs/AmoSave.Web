import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const backtestService = {
  async runBacktest(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/backtest/run', payload);
    return response.data.data;
  },
};
