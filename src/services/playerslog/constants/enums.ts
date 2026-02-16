export const GAME_STATUS = {
  SCHEDULED: '예정',
  IN_PROGRESS: '진행중',
  FINISHED: '종료',
  CANCELLED: '취소',
} as const;

export const SETTLEMENT_STATUS = {
  PENDING: '미정산',
  COMPLETED: '정산완료',
} as const;

export const GOLL_TYPE = {
  PREVIEW: 'Preview',
  REVIEW: 'Review',
} as const;

export const GOLL_STATUS = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
} as const;

export const REPORT_STATUS = {
  NORMAL: 'normal',
  REPORTED: 'reported',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export const MVP_TYPE = {
  PITCHER: 'Pitcher',
  BATTER: 'Batter',
} as const;

export const MVP_POSITION = {
  STARTER: 'Starter',
  MIDDLE: 'Middle',
  CLOSER: 'Closer',
  TOP: 'Top',
  CENTER: 'Center',
  BOTTOM: 'Bottom',
} as const;

export const CANCELLATION_REASONS = [
  '우천취소',
  '미세먼지',
  '천재지변',
  '기타',
] as const;
