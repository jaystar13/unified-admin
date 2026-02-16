export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: string;
  profileImage?: string;
  favoriteTeam?: string;
  status: UserStatus;
  reportedCount: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface AuthResponse {
  accessToken: string;
  user: AdminUser;
}
