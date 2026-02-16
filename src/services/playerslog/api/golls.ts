import apiClient from './api-client';
import type { Goll } from '@/services/playerslog/types';

export const gollsApi = {
  getGolls: async (filters?: { reportStatus?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.reportStatus) params.set('reportStatus', filters.reportStatus);
    if (filters?.search) params.set('search', filters.search);
    const { data } = await apiClient.get<Goll[]>(`/golls?${params}`);
    return data;
  },

  getGoll: async (id: number) => {
    const { data } = await apiClient.get<Goll>(`/golls/${id}`);
    return data;
  },

  updateGollStatus: async (id: number, status: string) => {
    const { data } = await apiClient.put<Goll>(`/golls/${id}/status`, { status });
    return data;
  },
};
