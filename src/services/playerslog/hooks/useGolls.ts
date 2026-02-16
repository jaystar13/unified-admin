import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gollsApi } from '@/services/playerslog/api';

export function useGolls(filters?: { reportStatus?: string; search?: string }) {
  return useQuery({
    queryKey: ['golls', filters],
    queryFn: () => gollsApi.getGolls(filters),
  });
}

export function useGoll(id: number) {
  return useQuery({
    queryKey: ['golls', id],
    queryFn: () => gollsApi.getGoll(id),
    enabled: !!id,
  });
}

export function useUpdateGollStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      gollsApi.updateGollStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golls'] });
    },
  });
}
