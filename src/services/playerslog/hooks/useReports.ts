import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/playerslog/api';

export function useReports(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['gollReports', filters],
    queryFn: () => reportsApi.getReports(filters),
  });
}
