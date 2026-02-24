import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const strategyService = {
  async getStrategies() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/strategies');
    return response.data.data;
  },
  async createStrategy(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/strategies', payload);
    return response.data.data;
  },
  async updateStrategyStatus(id: string, payload: Dictionary) {
    const response = await apiClient.patch<ApiEnvelope<Dictionary>>(`/strategies/${id}/status`, payload);
    return response.data.data;
  },
  async deleteStrategy(id: string) {
    const response = await apiClient.delete<ApiEnvelope<Dictionary>>(`/strategies/${id}`);
    return response.data.data;
  },
};
