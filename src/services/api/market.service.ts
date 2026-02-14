import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const marketService = {
  async getInstruments() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/market/instruments');
    return response.data.data;
  },
  async getQuotes(symbols: string[]) {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/market/quote', {
      params: { i: symbols },
    });
    return response.data.data;
  },
  async getOHLC(symbols: string[]) {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/market/ohlc', {
      params: { i: symbols },
    });
    return response.data.data;
  },
  async getLTP(symbols: string[]) {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/market/ltp', {
      params: { i: symbols },
    });
    return response.data.data;
  },
  async getHistorical(params: Dictionary) {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/market/historical', { params });
    return response.data.data;
  },
  async getTriggerRange(params: Dictionary) {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/market/trigger-range', { params });
    return response.data.data;
  },
};
