export type GollType = 'Preview' | 'Review';
export type GollStatus = 'active' | 'hidden';
export type ReportStatus = 'normal' | 'reported';
export type Prediction = 'Win' | 'Loss';

export interface Goll {
  id: number;
  type: GollType;
  title: string;
  content: string;
  author: string;
  authorId: string;
  prediction?: Prediction;
  mvp?: string;
  link?: string;
  gameId?: number;
  status: GollStatus;
  reportStatus: ReportStatus;
  reportReason?: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGollInput {
  type: GollType;
  title: string;
  content: string;
  prediction?: Prediction;
  mvp?: string;
  link?: string;
  gameId?: number;
}

export interface GollReaction {
  id: number;
  gollId: number;
  userId: string;
  type: 'like';
  createdAt: string;
}
