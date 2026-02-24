import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const dashboardService = {
  async getDashboardSummary() {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/dashboard/summary');
    return response.data.data;
  },
  async getPnlCalendar() {
    const response = await apiClient.get<ApiEnvelope<Dictionary>>('/dashboard/pnl-calendar');
    return response.data.data;
  },
};
