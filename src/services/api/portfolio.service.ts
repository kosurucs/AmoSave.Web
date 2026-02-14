import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const portfolioService = {
  async getPositions() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/portfolio/positions');
    return response.data.data;
  },
  async getHoldings() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/portfolio/holdings');
    return response.data.data;
  },
  async getAuctions() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/portfolio/holdings/auctions');
    return response.data.data;
  },
  async convertPosition(payload: Dictionary) {
    const response = await apiClient.put<ApiEnvelope<Dictionary>>('/portfolio/positions/convert', payload);
    return response.data.data;
  },
};
