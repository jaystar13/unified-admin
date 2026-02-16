import apiClient from './api-client';
import type { Game, GameHistory, CreateGameInput, UpdateGameInput } from '@/services/playerslog/types';

export const gamesApi = {
  getGames: async (filters?: { date?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.date) params.set('date', filters.date);
    if (filters?.status) params.set('status', filters.status);
    const { data } = await apiClient.get<Game[]>(`/games?${params}`);
    return data;
  },

  getGame: async (id: number) => {
    const { data } = await apiClient.get<Game>(`/games/${id}`);
    return data;
  },

  createGame: async (input: CreateGameInput) => {
    const { data } = await apiClient.post<Game>('/games', input);
    return data;
  },

  updateGame: async (id: number, input: UpdateGameInput) => {
    const { data } = await apiClient.put<Game>(`/games/${id}`, input);
    return data;
  },

  deleteGame: async (id: number) => {
    const { data } = await apiClient.delete(`/games/${id}`);
    return data;
  },

  updateGameStatus: async (id: number, status: string) => {
    const { data } = await apiClient.put<Game>(`/games/${id}/status`, { status });
    return data;
  },

  updateGameScore: async (id: number, score: { homeScore: number; awayScore: number }) => {
    const { data } = await apiClient.put<Game>(`/games/${id}/score`, score);
    return data;
  },

  getGameHistory: async () => {
    const { data } = await apiClient.get<GameHistory[]>('/games/history');
    return data;
  },

  bulkCreateGames: async (inputs: CreateGameInput[]) => {
    const { data } = await apiClient.post<Game[]>('/games/bulk', inputs);
    return data;
  },
};
