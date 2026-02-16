import apiClient from './api-client';

interface DashboardStats {
  totalUsers: number;
  todayGames: number;
  pendingReports: number;
  pendingSettlement: number;
}

interface Notification {
  id: number;
  type: string;
  message: string;
}

export const adminApi = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get<DashboardStats>('/admin/dashboard');
    return data;
  },

  getNotifications: async () => {
    const { data } = await apiClient.get<Notification[]>('/admin/notifications');
    return data;
  },
};
