export interface Settlement {
  id: number;
  gameId: number;
  status: 'completed';
  totalParticipants: number;
  totalPointsAwarded: number;
  winLoseCorrectCount: number;
  mvpTypeCorrectCount: number;
  mvpPositionCorrectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: number;
  gameId: number;
  userId: string;
  participationType: 'author' | 'like';
  winLosePoints: number;
  mvpTypePoints: number;
  mvpPositionPoints: number;
  totalPoints: number;
  sourceGollId: number;
  details: {
    prediction?: string;
    actualResult?: string;
    predictedMvpType?: string;
    actualMvpType?: string;
    predictedMvpPosition?: string;
    actualMvpPosition?: string;
    favoriteTeam?: string;
    winner?: string;
  };
  createdAt: string;
}

export interface SettlementHistory {
  id: number;
  gameId: number;
  action: 'settled' | 'cancelled';
  performedBy: string;
  performedAt: string;
  totalParticipants: number;
  totalPointsAwarded: number;
  reason: string | null;
  createdAt: string;
}

export interface SettlementProcessResult {
  processed: boolean;
  gameId: number;
  totalParticipants: number;
  totalPointsAwarded: number;
  winLoseCorrectCount: number;
  mvpTypeCorrectCount: number;
  mvpPositionCorrectCount: number;
}

export interface SettlementCancelResult {
  cancelled: boolean;
  gameId: number;
  rolledBackParticipants: number;
  rolledBackPoints: number;
}

export interface SettlementDetailResponse {
  settlement: Settlement | null;
  transactions: PointTransaction[];
  histories: SettlementHistory[];
}
