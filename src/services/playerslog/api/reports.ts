import apiClient from './api-client';
import type { GollReport } from '@/services/playerslog/types';

export const reportsApi = {
  getReports: async (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    const { data } = await apiClient.get<GollReport[]>(`/golls/reports?${params}`);
    return data;
  },
};
