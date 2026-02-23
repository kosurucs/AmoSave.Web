import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const AUTH_USER_NAME_STORAGE_KEY = 'amo.authUserName';
export const AUTH_ACCESS_KEY_STORAGE_KEY = 'amo.authAccessKey';

export type LoginRequest = {
  username: string;
  password: string;
};

export function getStoredAuthUserName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_USER_NAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthUserName(value: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!value) {
      window.localStorage.removeItem(AUTH_USER_NAME_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_USER_NAME_STORAGE_KEY, value);
  } catch {
    return;
  }
}

export function getStoredAuthAccessKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_ACCESS_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthAccessKey(value: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!value) {
      window.localStorage.removeItem(AUTH_ACCESS_KEY_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_ACCESS_KEY_STORAGE_KEY, value);
  } catch {
    return;
  }
}

export const authService = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/user-auth/login', payload);
    return response.data;
  },

  // async getRoles(accessKey: string) {
  //   const response = await apiClient.get<ApiEnvelope<Dictionary>>('/user-auth/roles', {
  //     params: { accessKey },
  //   });
  //   return response.data;
  // },
};
