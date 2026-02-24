import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const alertsService = {
  async getAlerts() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/alerts');
    return response.data.data;
  },
  async createAlert(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/alerts', payload);
    return response.data.data;
  },
  async deleteAlert(alertId: string) {
    const response = await apiClient.delete<ApiEnvelope<Dictionary>>(`/alerts/${alertId}`);
    return response.data.data;
  },
};
