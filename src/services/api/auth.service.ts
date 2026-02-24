import { apiClient } from '@/services/http/axios-client';
import { ApiEnvelope, Dictionary } from '@/shared/types/api';

export const AUTH_USER_NAME_STORAGE_KEY = 'amo.authUserName';
export const AUTH_ACCESS_KEY_STORAGE_KEY = 'amo.authAccessKey';
export const KITE_CONNECTED_STORAGE_KEY = 'amo.kiteConnected';
export const KITE_USER_ID_STORAGE_KEY = 'amo.kiteUserId';

export type LoginRequest = {
  username: string;
  password: string;
};

export type CreateSessionRequest = {
  requestToken: string;
};

// ── Username / Password Auth ─────────────────────────────────────────────────

export function getStoredAuthUserName(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(AUTH_USER_NAME_STORAGE_KEY); } catch { return null; }
}

export function setStoredAuthUserName(value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!value) { window.localStorage.removeItem(AUTH_USER_NAME_STORAGE_KEY); return; }
    window.localStorage.setItem(AUTH_USER_NAME_STORAGE_KEY, value);
  } catch { return; }
}

export function getStoredAuthAccessKey(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(AUTH_ACCESS_KEY_STORAGE_KEY); } catch { return null; }
}

export function setStoredAuthAccessKey(value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!value) { window.localStorage.removeItem(AUTH_ACCESS_KEY_STORAGE_KEY); return; }
    window.localStorage.setItem(AUTH_ACCESS_KEY_STORAGE_KEY, value);
  } catch { return; }
}

// ── Kite Connect Session ─────────────────────────────────────────────────────

export function getKiteConnected(): boolean {
  if (typeof window === 'undefined') return false;
  try { return window.localStorage.getItem(KITE_CONNECTED_STORAGE_KEY) === 'true'; } catch { return false; }
}

export function setKiteConnected(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (!value) {
      window.localStorage.removeItem(KITE_CONNECTED_STORAGE_KEY);
      window.localStorage.removeItem(KITE_USER_ID_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(KITE_CONNECTED_STORAGE_KEY, 'true');
  } catch { return; }
}

export function setKiteUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!userId) { window.localStorage.removeItem(KITE_USER_ID_STORAGE_KEY); return; }
    window.localStorage.setItem(KITE_USER_ID_STORAGE_KEY, userId);
  } catch { return; }
}

export function getKiteUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(KITE_USER_ID_STORAGE_KEY); } catch { return null; }
}

// ── API Calls ────────────────────────────────────────────────────────────────

export const authService = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/user-auth/login', payload);
    return response.data;
  },

  async getKiteLoginUrl(): Promise<string> {
    const response = await apiClient.get<ApiEnvelope<{ loginUrl: string }>>('/auth/login-url');
    return response.data.data.loginUrl;
  },

  async createKiteSession(requestToken: string) {
    const response = await apiClient.post<ApiEnvelope<Dictionary>>('/auth/session', { requestToken } as CreateSessionRequest);
    return response.data;
  },

  async destroyKiteSession() {
    const response = await apiClient.delete<ApiEnvelope<Dictionary>>('/auth/session');
    return response.data;
  },
};
