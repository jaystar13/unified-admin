import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/playerslog/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['dashboard', 'notifications'],
    queryFn: () => adminApi.getNotifications(),
  });
}
