import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const riskService = {
  async getRiskSettings() {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/risk/settings');
    return response.data.data;
  },
  async updateRiskSettings(payload: Dictionary) {
    const response = await apiClient.put<ApiEnvelope<Dictionary>>('/risk/settings', payload);
    return response.data.data;
  },
  async getRiskState() {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/risk/state');
    return response.data.data;
  },
  async haltTrading() {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/risk/halt', {});
    return response.data.data;
  },
};
