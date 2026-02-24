export type GameStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'SUSPENDED' | 'FINISHED' | 'CANCELLED';
export type SettlementStatus = '미정산' | '정산완료';
export type MvpType = 'Pitcher' | 'Batter';
export type MvpPosition = 'Starter' | 'Middle' | 'Closer' | 'Top' | 'Center' | 'Bottom';

export interface Game {
  id: number;
  season: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  status: GameStatus;
  homeScore: number;
  awayScore: number;
  winner?: string;
  mvp?: string;
  mvpType?: MvpType;
  mvpPosition?: MvpPosition;
  cancellationReason?: string;
  detailStatus?: string;
  isRescheduled: boolean;
  originalGameId?: number;
  seriesNumber: number;
  settlementStatus: SettlementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GameHistory {
  id: number;
  gameId: number;
  type: '등록' | '변경' | '취소' | '재편성' | '삭제';
  oldDate?: string;
  newDate?: string;
  reason?: string;
  changedAt: string;
}

export interface CreateGameInput {
  season: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  seriesNumber?: number;
  isRescheduled?: boolean;
  originalGameId?: number;
}

export interface UpdateGameInput extends Partial<CreateGameInput> {
  status?: GameStatus;
  homeScore?: number;
  awayScore?: number;
  winner?: string;
  mvp?: string;
  mvpType?: MvpType;
  mvpPosition?: MvpPosition;
  cancellationReason?: string;
  detailStatus?: string;
  settlementStatus?: SettlementStatus;
}
