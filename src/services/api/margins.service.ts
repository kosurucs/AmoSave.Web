import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const marginsService = {
  async orderMargins(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/margins/orders', payload);
    return response.data.data;
  },
  async basketMargins(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/margins/basket', payload);
    return response.data.data;
  },
  async contractNotes(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/charges/orders', payload);
    return response.data.data;
  },
};
