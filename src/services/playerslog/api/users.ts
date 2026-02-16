import apiClient from './api-client';
import type { User } from '@/services/playerslog/types';

export const usersApi = {
  getUsers: async (filters?: { search?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status) params.set('status', filters.status);
    const { data } = await apiClient.get<User[]>(`/users?${params}`);
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const { data } = await apiClient.put<User>(`/users/${id}/status`, { status });
    return data;
  },
};
