import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const userService = {
  async getProfile() {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/user/profile');
    return response.data.data;
  },
  async getMargins(segment?: string) {
    const path = segment ? `/user/margins/${segment}` : '/user/margins';
    const response = await apiClient.get<ApiEnvelope<Dictionary>>(path);
    return response.data.data;
  },
};
