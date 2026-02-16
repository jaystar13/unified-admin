import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '@/services/playerslog/api';

export function useProcessSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: number) => settlementsApi.processSettlement(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useCancelSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gameId: number) => settlementsApi.cancelSettlement(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useConfirmResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      gameId,
      result,
    }: {
      gameId: number;
      result: {
        winner?: string;
        mvp?: string;
        mvpType?: string;
        mvpPosition?: string;
      };
    }) => settlementsApi.confirmResult(gameId, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
