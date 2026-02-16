import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesApi } from '@/services/playerslog/api';
import type { CreateGameInput, UpdateGameInput } from '@/services/playerslog/types';

export function useGames(filters?: { date?: string; status?: string }) {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => gamesApi.getGames(filters),
  });
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => gamesApi.getGame(id),
    enabled: !!id,
  });
}

export function useGameHistory() {
  return useQuery({
    queryKey: ['games', 'history'],
    queryFn: () => gamesApi.getGameHistory(),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGameInput) => gamesApi.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGameInput }) =>
      gamesApi.updateGame(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gamesApi.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGameStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      gamesApi.updateGameStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGameScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, score }: { id: number; score: { homeScore: number; awayScore: number } }) =>
      gamesApi.updateGameScore(id, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useBulkCreateGames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGameInput[]) => gamesApi.bulkCreateGames(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}
