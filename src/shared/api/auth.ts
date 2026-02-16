import authApiClient from './api-client';

interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  nickname: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const { data } = await authApiClient.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  getMe: async () => {
    const { data } = await authApiClient.get<AuthUser>('/auth/me');
    return data;
  },
};
