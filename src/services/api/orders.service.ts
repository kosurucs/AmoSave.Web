import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const ordersService = {
  async getOrders() {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>('/orders');
    return response.data.data;
  },
  async getOrderHistory(orderId: string) {
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>(`/orders/${orderId}/history`);
    return response.data.data;
  },
  async getTrades(orderId?: string) {
    const path = orderId ? `/orders/${orderId}/trades` : '/trades';
    const response = await apiClient.get<ApiEnvelope<Dictionary[]>>(path);
    return response.data.data;
  },
  async placeOrder(payload: Dictionary) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/orders', payload);
    return response.data.data;
  },
  async modifyOrder(orderId: string, payload: Dictionary) {
    const response = await apiClient.put<ApiEnvelope<Dictionary>>(`/orders/${orderId}`, payload);
    return response.data.data;
  },
  async cancelOrder(orderId: string) {
    const response = await apiClient.delete<ApiEnvelope<Dictionary>>(`/orders/${orderId}`);
    return response.data.data;
  },
};
