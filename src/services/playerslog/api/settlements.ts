import apiClient from './api-client';
import type { Game } from '@/services/playerslog/types';
import type {
  SettlementProcessResult,
  SettlementCancelResult,
  SettlementDetailResponse,
} from '@/services/playerslog/types/settlement';

export const settlementsApi = {
  processSettlement: async (gameId: number) => {
    const { data } = await apiClient.post<SettlementProcessResult>(
      `/settlements/${gameId}/process`,
    );
    return data;
  },

  cancelSettlement: async (gameId: number) => {
    const { data } = await apiClient.delete<SettlementCancelResult>(
      `/settlements/${gameId}`,
    );
    return data;
  },

  getSettlementDetail: async (gameId: number) => {
    const { data } = await apiClient.get<SettlementDetailResponse>(
      `/settlements/${gameId}`,
    );
    return data;
  },

  confirmResult: async (
    gameId: number,
    result: {
      winner?: string;
      mvp?: string;
      mvpType?: string;
      mvpPosition?: string;
    },
  ) => {
    const { data } = await apiClient.put<Game>(
      `/settlements/${gameId}/result`,
      result,
    );
    return data;
  },
};
